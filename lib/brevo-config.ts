/**
 * Brevo (formerly Sendinblue) transactional email config.
 * https://app.brevo.com → SMTP & API → API keys
 */

const DEFAULT_FROM_NAME = "Eagle Medical";

/** Brevo API key (server-only). */
export function getBrevoApiKey() {
  return process.env.BREVO_API_KEY?.trim() || null;
}

export type BrevoSender = {
  name: string;
  email: string;
};

/**
 * Sender used in Brevo `sender` object.
 * Accepts `noreply@domain.com` or `Name <noreply@domain.com>`.
 * Set BREVO_FROM_EMAIL (required for production). Optional BREVO_FROM_NAME.
 */
export function getBrevoSender(): BrevoSender | null {
  const raw = process.env.BREVO_FROM_EMAIL?.trim();
  if (!raw) return null;

  const nameOverride = process.env.BREVO_FROM_NAME?.trim();

  const angled = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (angled) {
    return {
      name: nameOverride || angled[1].trim() || DEFAULT_FROM_NAME,
      email: angled[2].trim().toLowerCase(),
    };
  }

  if (/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(raw)) {
    return {
      name: nameOverride || DEFAULT_FROM_NAME,
      email: raw.toLowerCase(),
    };
  }

  return null;
}

export function getBrevoFromDomain() {
  const sender = getBrevoSender();
  return sender?.email.split("@")[1]?.toLowerCase() ?? null;
}

export function enrichBrevoError(message: string) {
  const domain = getBrevoFromDomain();
  const lower = message.toLowerCase();

  if (
    /sender|not registered|unrecognised|unrecognized|invalid.*email|domain/i.test(
      lower
    )
  ) {
    return (
      `${message} ` +
      `(Sending as ${domain ?? "your BREVO_FROM_EMAIL domain"}. ` +
      "In Brevo → Senders, Domains & Dedicated IPs, verify that sender email (or its domain), " +
      "then set BREVO_FROM_EMAIL to that exact address. On Netlify, update env vars and redeploy.)"
    );
  }

  return message;
}
