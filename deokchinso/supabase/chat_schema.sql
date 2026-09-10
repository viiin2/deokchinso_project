-- Run this once in Supabase Dashboard > SQL Editor.

alter table public.messages add column if not exists room_id text;
alter table public.messages add column if not exists sender_id text;
alter table public.messages add column if not exists contents text;
alter table public.messages add column if not exists created_at timestamptz default now();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id text primary key,
  post_id text,
  title text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_room_members (
  room_id text not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- message_id is text so this migration remains compatible with bigint or UUID messages.id.
create table if not exists public.message_reads (
  message_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create index if not exists messages_room_id_created_at_idx
  on public.messages (room_id, created_at);
create index if not exists chat_room_members_user_id_idx
  on public.chat_room_members (user_id, room_id);
create index if not exists message_reads_message_id_idx
  on public.message_reads (message_id);

alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.message_reads enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.chat_rooms to authenticated;
grant select, insert on public.chat_room_members to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.message_reads to authenticated;

drop policy if exists "profiles_are_readable" on public.profiles;
drop policy if exists "users_manage_own_profile" on public.profiles;
create policy "profiles_are_readable" on public.profiles
  for select to authenticated using (true);
create policy "users_manage_own_profile" on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "rooms_are_readable" on public.chat_rooms;
drop policy if exists "users_create_rooms" on public.chat_rooms;
create policy "rooms_are_readable" on public.chat_rooms
  for select to authenticated using (true);
create policy "users_create_rooms" on public.chat_rooms
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "room_members_are_readable" on public.chat_room_members;
drop policy if exists "users_join_themselves" on public.chat_room_members;
create policy "room_members_are_readable" on public.chat_room_members
  for select to authenticated using (true);
create policy "users_join_themselves" on public.chat_room_members
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "messages_are_readable" on public.messages;
drop policy if exists "users_send_own_messages" on public.messages;
create policy "messages_are_readable" on public.messages
  for select to authenticated using (true);
create policy "users_send_own_messages" on public.messages
  for insert to authenticated with check (sender_id = auth.uid()::text);

drop policy if exists "message_reads_are_readable" on public.message_reads;
drop policy if exists "users_record_own_reads" on public.message_reads;
create policy "message_reads_are_readable" on public.message_reads
  for select to authenticated using (true);
create policy "users_record_own_reads" on public.message_reads
  for insert to authenticated with check (user_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.message_reads;
exception
  when duplicate_object then null;
end;
$$;

notify pgrst, 'reload schema';
