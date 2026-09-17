import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured, getSession } from "../lib/supabase";
import { useStore } from "../store";

export const serializeResume = (state) => ({
  personalDetails: state.personalDetails || {},
  socialLinks: state.socialLinks || [],
  workHistory: state.workHistory || [],
  education: state.education || [],
  skills: state.skills || [],
  resumeSummary: state.resumeSummary || "",
  additionalSections: state.additionalSections || [],
  resumeSettings: state.resumeSettings || {},
});

const isEmptyResume = (state) =>
  !Object.keys(state.personalDetails || {}).length &&
  !(state.socialLinks || []).length &&
  !(state.workHistory || []).length &&
  !(state.resumeSummary || "");

export const useSupabaseSync = () => {
  const [user, setUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return undefined;
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session && session.user ? session.user : null);
      }
    );
    getSession().then((session) => setUser(session ? session.user : null));
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !user) return undefined;

    const hydrateIfEmpty = async () => {
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("data")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error || !data || !data.data) return;
        const local = useStore.getState();
        if (!isEmptyResume(local)) return;
        useStore.setState({ ...data.data });
      } catch {
        /* offline or missing table — keep local-only */
      }
    };
    hydrateIfEmpty();

    const unsubscribe = useStore.subscribe(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        setSyncing(true);
        try {
          await supabase.from("resumes").upsert(
            {
              user_id: user.id,
              data: serializeResume(useStore.getState()),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } catch {
          /* offline — local draft unchanged; retry on next change */
        } finally {
          setSyncing(false);
        }
      }, 800);
    });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [user]);

  return { user, syncing: Boolean(user && syncing) };
};