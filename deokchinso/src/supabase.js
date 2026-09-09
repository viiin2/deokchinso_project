import { createClient } from "@supabase/supabase-js";

// 🌟 슈퍼베이스 대시보드에서 본인의 URL과 anon key를 복사해서 아래에 붙여넣으세요!
const supabaseUrl =
  "https://supabase.com/dashboard/project/thgoctcfokkkfvkprkim.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ29jdGNmb2tra2Z2a3Bya2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NjExMDksImV4cCI6MjEwNDIzNzEwOX0.guGNr_lg6cDzQGr-RrQnFAXu_01DSugKnnJiEr9u0M8";

export const supabase = createClient(supabaseUrl, supabaseKey);
