import { enrichResendError, getResendApiKey, getResendFromAddress } from "./resend-config";
import { getSiteUrl } from "./site-url";
import { createServiceClient } from "./supabase/admin";

export type PasswordResetRequest = {
  email: string;
  /** Where to send the user after verifyOtp succeeds */
  nextPath: string;
};

/**
 * Cross-device safe password reset:
 * Uses service-role generateLink + token_hash (no PKCE cookie needed),
 * then emails the link via Resend.
 */
export async function sendPasswordResetEmail(
  payload: PasswordResetRequest
): Promise<{ ok: boolean; error?: string }> {
  const email = payload.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  const nextPath =
    payload.nextPath.startsWith("/") && !payload.nextPath.startsWith("//")
      ? payload.nextPath
      : "/reset-password/update";

  const service = createServiceClient();
  if (!service) {
    return {
      ok: false,
      error:
        "Password reset is not configured (missing SUPABASE_SERVICE_ROLE_KEY). Add it in Netlify env and redeploy.",
    };
  }

  const key = getResendApiKey();
  if (!key) {
    return {
      ok: false,
      error:
        "Password reset email is not configured (missing RESEND_API_KEY). Add it in Netlify env and redeploy.",
    };
  }

  const { data, error } = await service.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !data?.properties?.hashed_token) {
    // Do not reveal whether the email exists
    console.warn(
      "[password-reset] generateLink failed:",
      error?.message ?? "missing hashed_token"
    );
    return { ok: true };
  }

  const siteUrl = getSiteUrl();
  // Link straight to the update page with token_hash. Verification runs in the
  // browser only — so email security scanners that prefetch the URL cannot
  // consume the one-time recovery token before the user opens it.
  const resetUrl =
    `${siteUrl}${nextPath}` +
    `?token_hash=${encodeURIComponent(data.properties.hashed_token)}` +
    `&type=recovery`;

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px;">
      <h2 style="color: #004d4d; margin-bottom: 0.35rem;">Reset your password</h2>
      <p>We received a request to reset the password for <strong>${email}</strong>.</p>
      <p>Click the button below to choose a new password. This link works on any device.</p>
      <p style="font-size: 0.9rem; color: #64748b;">Tip: open the link in your phone or computer browser (not an in-app preview).</p>
      <p style="margin: 1.5rem 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#009966;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">
          Create new password
        </a>
      </p>
      <p style="font-size: 0.9rem; color: #64748b;">If the button does not work, copy and paste this link:</p>
      <p style="font-size: 0.85rem; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="font-size: 0.9rem; color: #64748b;">If you did not request this, you can ignore this email.</p>
      <p style="margin-top: 1.5rem;">— Eagle Medical</p>
    </div>
  `;

  const text = [
    "Reset your password",
    "",
    `We received a request to reset the password for ${email}.`,
    "",
    "Open this link to choose a new password (works on any device):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— Eagle Medical",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromAddress(),
      to: [email],
      subject: "Reset your Eagle Medical password",
      text,
      html,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let errMsg = `Email could not be sent (HTTP ${res.status}).`;
    try {
      const body = JSON.parse(raw) as { message?: string };
      if (body.message) errMsg = enrichResendError(body.message);
    } catch {
      if (raw) errMsg = raw.slice(0, 280);
    }
    console.error("[password-reset] Resend error:", errMsg);
    return { ok: false, error: errMsg };
  }

  return { ok: true };
}
