import { createClient } from "@supabase/supabase-js";

const url =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.PUBLIC_SUPABASE_URL
    : "";
const anonKey =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    : "";

export const isSupabaseConfigured = () => Boolean(url && anonKey);

export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/**
 * Google sign-in. Only meaningful when PUBLIC_SUPABASE_URL / ANON_KEY are set.
 * Signing in keeps the current local resume untouched; sync happens in the
 * background via useSupabaseSync.
 */
export const signInWithGoogle = async () => {
  if (!supabase) return { error: new Error("Supabase is not configured.") };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/editor" },
  });
  if (error) return { error };
  return { data };
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};