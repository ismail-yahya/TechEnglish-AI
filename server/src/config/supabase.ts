import { createClient } from "@supabase/supabase-js";
import { config } from "./env";

// Ensure config has supabase credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase credentials in .env");
}

export const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || "",
);
