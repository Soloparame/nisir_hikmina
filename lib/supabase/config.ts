function trimEnv(value: string | undefined) {
  const v = value?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getSupabaseUrl() {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseKey() {
  return (
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.includes("supabase.co"));
}

/** Safe summary for health checks (no secrets). */
export function getSupabaseConfigStatus() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return {
    configured: isSupabaseConfigured(),
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlHost: url ? new URL(url).host : null,
    keyKind: key?.startsWith("eyJ")
      ? "anon_jwt"
      : key?.startsWith("sb_publishable_")
        ? "publishable"
        : key
          ? "other"
          : null,
  };
}
