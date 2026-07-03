import { createClient } from "@supabase/supabase-js";
import { assertSupabaseConfig, supabaseConfig } from "./config.js";

assertSupabaseConfig();

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
