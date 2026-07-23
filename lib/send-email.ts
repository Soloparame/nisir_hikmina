import {
  enrichBrevoError,
  getBrevoApiKey,
  getBrevoSender,
} from "./brevo-config";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  error?: string;
};

/**
 * Send a transactional email via Brevo SMTP API.
 * https://developers.brevo.com/reference/send-transac-email
 */
export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const key = getBrevoApiKey();
  if (!key) {
    return {
      ok: false,
      error:
        "BREVO_API_KEY is not set — email not sent. Add it in .env.local / Netlify env and redeploy.",
    };
  }

  const sender = getBrevoSender();
  if (!sender) {
    return {
      ok: false,
      error:
        "BREVO_FROM_EMAIL is not set (or invalid). Use a verified sender like noreply@eaglemedicalcare.com.",
    };
  }

  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  if (recipients.length === 0) {
    return { ok: false, error: "Recipient email is missing." };
  }

  const body: Record<string, unknown> = {
    sender,
    to: recipients,
    subject: input.subject,
    htmlContent: input.html,
  };
  if (input.text?.trim()) {
    body.textContent = input.text;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    let errMsg = `Email could not be sent (HTTP ${res.status}).`;
    try {
      const parsed = JSON.parse(raw) as {
        message?: string;
        code?: string;
      };
      if (parsed.message) {
        errMsg = enrichBrevoError(
          parsed.code ? `${parsed.message} (${parsed.code})` : parsed.message
        );
      } else if (raw) {
        errMsg = raw.slice(0, 280);
      }
    } catch {
      if (raw) errMsg = raw.slice(0, 280);
    }
    return { ok: false, error: errMsg };
  }

  return { ok: true };
}
