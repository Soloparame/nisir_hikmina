const DEFAULT_FROM = "Eagle Medical <onboarding@resend.dev>";

/** Resend API key (server-only). */
export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

/**
 * From address for Resend.
 * Accepts `noreply@domain.com` or `Name <noreply@domain.com>`.
 */
export function getResendFromAddress() {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return DEFAULT_FROM;

  // Plain email only
  if (/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(raw)) {
    return `Eagle Medical <${raw}>`;
  }

  return raw;
}

export function getResendFromDomain() {
  const from = getResendFromAddress();
  const match = from.match(/<([^>]+)>/) ?? from.match(/([\w.-]+@[\w.-]+\.\w+)/);
  const email = match?.[1] ?? "";
  return email.split("@")[1]?.toLowerCase() ?? null;
}

export function enrichResendError(message: string) {
  if (!/domain is not verified/i.test(message)) return message;

  const domain = getResendFromDomain();
  return (
    `${message} ` +
    `(Sending as ${domain ?? "your domain"}. ` +
    "Use an API key from the same Resend account where the domain shows Verified, " +
    "and set RESEND_FROM_EMAIL to an address on that domain — e.g. noreply@eaglemedicalcare.com. " +
    "On Netlify, update env vars and redeploy.)"
  );
}
