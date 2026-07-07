/** Public site origin for links in emails (no trailing slash). */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export function getDoctorLoginUrl(loginCode: string) {
  const code = loginCode.trim().toUpperCase();
  return `${getSiteUrl()}/doctor/${code}/login`;
}
