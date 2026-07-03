import { useEffect, useState } from "react";
import {
  getCurrentSession,
  onAuthStateChange,
  signInWithGoogle,
  signOut,
} from "../lib/supabase/auth.js";
import { hasSupabaseConfig } from "../lib/supabase/config.js";

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthActionPending, setIsAuthActionPending] = useState(false);
  const [authError, setAuthError] = useState("");
  const isAuthConfigured = hasSupabaseConfig();

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setSession(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAuthLoading(false);
      });

    const { data } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError("");
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setAuthError("");
    setIsAuthActionPending(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError("Unable to sign in. Please try again.");
      }
    } catch {
      setAuthError("Unable to sign in. Please try again.");
    } finally {
      setIsAuthActionPending(false);
    }
  };

  const signOutUser = async () => {
    setAuthError("");
    setIsAuthActionPending(true);

    try {
      const { error } = await signOut();
      if (error) {
        setAuthError("Unable to sign out. Please try again.");
      }
    } catch {
      setAuthError("Unable to sign out. Please try again.");
    } finally {
      setIsAuthActionPending(false);
    }
  };

  return {
    authError,
    isAuthActionPending,
    isAuthConfigured,
    isAuthLoading,
    session,
    signIn,
    signOut: signOutUser,
    user: session?.user ?? null,
  };
}
