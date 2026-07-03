import { getSupabaseClient, supabase } from "./client.js";

function getAuthRedirectUrl() {
  return `${window.location.origin}/app`;
}

export function getCurrentSession() {
  if (!supabase) {
    return Promise.resolve({ data: { session: null }, error: null });
  }

  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    return {
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export function signInWithGoogle() {
  return getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  });
}

export function signOut() {
  return getSupabaseClient().auth.signOut();
}
