import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}

export { isSupabaseConfigured };
