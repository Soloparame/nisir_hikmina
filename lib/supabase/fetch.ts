/** Surface clearer errors than bare "fetch failed" in server logs and UI. */
export async function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "fetch failed" || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
      throw new Error(
        "Cannot reach Supabase. On Netlify: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY), save, then redeploy. Check the Supabase project is not paused."
      );
    }
    throw e;
  }
}
