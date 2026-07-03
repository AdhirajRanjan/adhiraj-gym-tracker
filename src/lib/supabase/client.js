import { createClient } from "@supabase/supabase-js";
import { assertSupabaseConfig, hasSupabaseConfig, supabaseConfig } from "./config.js";

export const supabase = hasSupabaseConfig()
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseClient() {
  assertSupabaseConfig();
  return supabase;
}
