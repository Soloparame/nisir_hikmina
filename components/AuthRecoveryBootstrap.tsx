"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Props = {
  children: (state: {
    ready: boolean;
    hasSession: boolean;
    error: string;
  }) => React.ReactNode;
};

/**
 * Handles password-recovery links that land with hash tokens
 * (#access_token=...&type=recovery) instead of a ?code= query param.
 */
export default function AuthRecoveryBootstrap({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const supabase = createClient();
      if (!supabase) {
        if (active) {
          setError("Supabase is not configured on this site.");
          setReady(true);
        }
        return;
      }

      // Hash-based recovery (older / alternate Supabase email templates)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const type = hash.get("type");

        if (accessToken && refreshToken && type === "recovery") {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!active) return;

          if (sessionError) {
            setError(sessionError.message);
            setReady(true);
            return;
          }

          // Clean hash so the token is not left in the URL bar
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      setHasSession(Boolean(session));
      if (!session) {
        setError(
          "Reset link expired or already used. Request a new password reset email."
        );
      }
      setReady(true);
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  return <>{children({ ready, hasSession, error })}</>;
}
