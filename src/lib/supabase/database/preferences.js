import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

export async function getUserPreferences(userId) {
  return getSupabaseClient()
    .from(TABLES.userPreferences)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function upsertUserPreferences(preferences) {
  return getSupabaseClient()
    .from(TABLES.userPreferences)
    .upsert(preferences, { onConflict: "user_id" })
    .select("*")
    .single();
}

export async function updateUserPreferences(userId, updates) {
  return getSupabaseClient()
    .from(TABLES.userPreferences)
    .update(updates)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export async function deleteUserPreferences(userId) {
  return getSupabaseClient()
    .from(TABLES.userPreferences)
    .delete()
    .eq("user_id", userId);
}
