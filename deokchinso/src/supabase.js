import { createClient } from "@supabase/supabase-js";

// 🌟 대시보드 경로를 싹 빼고, 올바른 API URL 형식으로 수정합니다!
const supabaseUrl = "https://thgoctcfokkkfvkprkim.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ29jdGNmb2tra2Z2a3Bya2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NjExMDksImV4cCI6MjEwNDIzNzEwOX0.guGNr_lg6cDzQGr-RrQnFAXu_01DSugKnnJiEr9u0M8";

export const supabase = createClient(supabaseUrl, supabaseKey);
