import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn(
        "[Eagle Medical] Supabase env vars missing in this build. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) on Netlify, then redeploy."
      );
    }
    return null;
  }

  return createBrowserClient(url, key);
}

export { isSupabaseConfigured };
