import { createClient } from "@supabase/supabase-js";

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const BUCKET_NAME = "images";
export const GAMES_TABLE = "games";