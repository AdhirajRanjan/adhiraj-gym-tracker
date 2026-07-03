import { getSupabaseClient } from "../client.js";
import { TABLES } from "./tables.js";

export async function getProfile(userId) {
  return getSupabaseClient()
    .from(TABLES.profiles)
    .select("*")
    .eq("id", userId)
    .maybeSingle();
}

export async function upsertProfile(profile) {
  return getSupabaseClient()
    .from(TABLES.profiles)
    .upsert(profile, { onConflict: "id" })
    .select("*")
    .single();
}

export async function updateProfile(userId, updates) {
  return getSupabaseClient()
    .from(TABLES.profiles)
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();
}

export async function deleteProfile(userId) {
  return getSupabaseClient()
    .from(TABLES.profiles)
    .delete()
    .eq("id", userId);
}
