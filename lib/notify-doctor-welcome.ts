import { getDoctorLoginUrl } from "./site-url";
import {
  enrichResendError,
  getResendApiKey,
  getResendFromAddress,
} from "./resend-config";

export type DoctorWelcomePayload = {
  doctor_name: string;
  doctor_email: string;
  login_code: string;
  specialization?: string;
};

const DEFAULT_DOCTOR_WHATSAPP_GROUP =
  "https://chat.whatsapp.com/BVcdM8SO8Ch7FOzUA1RXrK?mode=gi_t";

function getDoctorWhatsappGroupUrl() {
  return (
    process.env.DOCTOR_WHATSAPP_GROUP_URL?.trim() ||
    DEFAULT_DOCTOR_WHATSAPP_GROUP
  );
}

function whatsappGroupBlockText() {
  const url = getDoctorWhatsappGroupUrl();
  return [
    "",
    "Join our Eagle Medical doctors WhatsApp group:",
    url,
  ];
}

function whatsappGroupBlockHtml() {
  const url = getDoctorWhatsappGroupUrl();
  return `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1rem 1.15rem; margin: 1.25rem 0;">
        <p style="margin: 0 0 0.5rem;"><strong>Join our doctors WhatsApp group</strong></p>
        <p style="margin: 0; font-size: 0.92rem;">Stay connected with the team — tap to join:</p>
        <p style="margin: 0.65rem 0 0;"><a href="${escapeHtml(url)}" style="color: #009966; font-weight: 600;">${escapeHtml(url)}</a></p>
      </div>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatDoctorWelcomeMessage(p: DoctorWelcomePayload) {
  const loginUrl = getDoctorLoginUrl(p.login_code);
  const lines = [
    "Welcome to Eagle Medical",
    "",
    `Hello ${p.doctor_name},`,
    "",
    "Your doctor portal account is ready. Use the details below to sign in and set your password on first visit.",
    "",
    `Doctor ID: ${p.login_code.toUpperCase()}`,
    `Login link: ${loginUrl}`,
    `Registered email: ${p.doctor_email}`,
    ...(p.specialization ? [`Specialty: ${p.specialization}`] : []),
    "",
    "First visit:",
    "1. Open the login link above",
    "2. Enter your Doctor ID and registered email",
    "3. Create your password",
    "",
    "After that, use the same link with your email, password, and Doctor ID.",
    "",
    "Once signed in, open Profile to update your bio, photo, and availability times. Changes sync with the admin panel.",
    ...whatsappGroupBlockText(),
    "",
    "— Eagle Medical",
  ];
  return { text: lines.join("\n"), loginUrl };
}

export async function notifyDoctorWelcome(
  p: DoctorWelcomePayload
): Promise<{ sent: boolean; error?: string }> {
  const key = getResendApiKey();
  if (!key) {
    const msg =
      "RESEND_API_KEY is not set — welcome email not sent. Add it in .env.local / Netlify env.";
    console.warn("[notify-doctor-welcome]", msg);
    return { sent: false, error: msg };
  }

  const to = p.doctor_email.trim();
  if (!to) {
    return { sent: false, error: "Doctor email is missing." };
  }

  const from = getResendFromAddress();

  const { text, loginUrl } = formatDoctorWelcomeMessage(p);
  const subject = "Your Eagle Medical doctor portal login";
  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px;">
      <h2 style="color: #004d4d; margin-bottom: 0.25rem;">Welcome to Eagle Medical</h2>
      <p>Hello <strong>${escapeHtml(p.doctor_name)}</strong>,</p>
      <p>Your doctor portal account is ready. Use the details below to sign in and <strong>create your password on first visit</strong>.</p>
      <div style="background: #f4fbf8; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem 1.15rem; margin: 1.25rem 0;">
        <p style="margin: 0 0 0.5rem;"><strong>Doctor ID</strong><br /><code style="font-size: 1.05rem;">${escapeHtml(p.login_code.toUpperCase())}</code></p>
        <p style="margin: 0 0 0.5rem;"><strong>Registered email</strong><br />${escapeHtml(to)}</p>
        ${p.specialization ? `<p style="margin: 0 0 0.5rem;"><strong>Specialty</strong><br />${escapeHtml(p.specialization)}</p>` : ""}
        <p style="margin: 0;"><strong>Login link</strong><br /><a href="${escapeHtml(loginUrl)}" style="color: #009966;">${escapeHtml(loginUrl)}</a></p>
      </div>
      <p><strong>First visit</strong></p>
      <ol>
        <li>Open the login link above</li>
        <li>Enter your Doctor ID and registered email</li>
        <li>Create your password</li>
      </ol>
      <p style="color: #64748b; font-size: 0.92rem;">After that, use the same link with your email, password, and Doctor ID.</p>
      <p>Once signed in, open <strong>Profile</strong> to update your bio, photo, and availability. Changes sync with the admin panel.</p>
      ${whatsappGroupBlockHtml()}
      <p style="margin-top: 1.5rem;">— Eagle Medical</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
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
    console.error("[notify-doctor-welcome] Resend error:", errMsg);
    return { sent: false, error: errMsg };
  }

  return { sent: true };
}
