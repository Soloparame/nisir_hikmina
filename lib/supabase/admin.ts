import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./config";
import { supabaseFetch } from "./fetch";

function trimEnv(value: string | undefined) {
  const v = value?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** Bypasses RLS for trusted server-side admin actions when configured. */
export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    global: { fetch: supabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
