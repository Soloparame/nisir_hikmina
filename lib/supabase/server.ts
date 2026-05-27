import "./node-dns";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseKey, getSupabaseUrl } from "./config";
import { supabaseFetch } from "./fetch";

export async function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}
