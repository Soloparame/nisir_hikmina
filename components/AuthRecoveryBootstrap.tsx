"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";

type Props = {
  children: (state: {
    ready: boolean;
    hasSession: boolean;
    error: string;
  }) => React.ReactNode;
};

/** Share one verify attempt per token so React remounts / Strict Mode cannot burn it twice. */
const verifyInflight = new Map<string, Promise<{ error: string | null }>>();

function cleanAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("code");
  window.history.replaceState(
    {},
    document.title,
    url.pathname + url.search + url.hash
  );
}

/**
 * Establishes a recovery session for password reset pages.
 * Prefers client-side verifyOtp(token_hash) so email security scanners
 * (which only GET the link, without running JS) cannot consume the one-time token.
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

      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;

      if (tokenHash && type) {
        let verifyResult = verifyInflight.get(tokenHash);
        if (!verifyResult) {
          verifyResult = (async () => {
            const { error: otpError } = await supabase.auth.verifyOtp({
              type,
              token_hash: tokenHash,
            });
            return { error: otpError?.message ?? null };
          })();
          verifyInflight.set(tokenHash, verifyResult);
        }

        const result = await verifyResult;
        cleanAuthParamsFromUrl();

        if (result.error) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            if (active) {
              setError(
                /expired|invalid|already/i.test(result.error)
                  ? "Reset link expired or already used. Request a new password reset email."
                  : result.error
              );
              setHasSession(false);
              setReady(true);
            }
            return;
          }
        }
      } else if (typeof window !== "undefined" && window.location.hash) {
        // Hash-based recovery (older / alternate Supabase email templates)
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const hashType = hash.get("type");

        if (accessToken && refreshToken && hashType === "recovery") {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );

          if (!active) return;

          if (sessionError) {
            setError(sessionError.message);
            setReady(true);
            return;
          }
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
