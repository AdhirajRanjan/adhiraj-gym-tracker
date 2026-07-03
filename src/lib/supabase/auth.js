import { supabase } from "./client.js";

export function getCurrentSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export function signOut() {
  return supabase.auth.signOut();
}
