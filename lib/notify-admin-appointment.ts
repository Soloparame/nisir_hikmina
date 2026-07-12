import {
  enrichResendError,
  getResendApiKey,
  getResendFromAddress,
} from "./resend-config";
/**
 * Sends admin alerts when a patient books an appointment.
 *
 * Email: set RESEND_API_KEY (https://resend.com) — free tier works with onboarding@resend.dev
 * Telegram: set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (admin must /start the bot once; get chat_id from getUpdates)
 * WhatsApp: optional CALLMEBOT_API_KEY — https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */

export type AppointmentNotifyPayload = {
  patient_name: string;
  phone: string;
  disease: string;
  telegram: string;
  country: string;
  city: string;
  consult_type: string;
  doctor_name: string;
  availability_time?: string;
};

const DEFAULT_ADMIN_EMAIL = "fisihaguade2127@gmail.com";
const DEFAULT_ADMIN_TELEGRAM = "@NisirAd";
/** Ethiopia mobile 09… → international without + for CallMeBot */
const DEFAULT_ADMIN_WHATSAPP_PHONE = "251947018285";

function getAdminEmail() {
  return process.env.ADMIN_NOTIFY_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
}

function getAdminWhatsappPhone() {
  return (
    process.env.ADMIN_NOTIFY_WHATSAPP_E164?.replace(/\D/g, "") ||
    DEFAULT_ADMIN_WHATSAPP_PHONE
  );
}

function getAdminTelegramDisplay() {
  return process.env.ADMIN_NOTIFY_TELEGRAM?.trim() || DEFAULT_ADMIN_TELEGRAM;
}

export function formatAppointmentMessage(p: AppointmentNotifyPayload) {
  const lines = [
    "New appointment — Eagle Medical",
    "",
    `Doctor: ${p.doctor_name}`,
    `Patient: ${p.patient_name}`,
    `Phone: ${p.phone}`,
    `Patient Telegram: ${p.telegram}`,
    `Country / City: ${p.country} / ${p.city}`,
    `Reason / concern: ${p.disease}`,
    `Consult type: ${p.consult_type}`,
    ...(p.availability_time ? [`Availability: ${p.availability_time}`] : []),
    "",
    `Admin Telegram: ${getAdminTelegramDisplay()}`,
    `Admin WhatsApp: +${getAdminWhatsappPhone()}`,
  ];
  return lines.join("\n");
}

async function sendResendEmail(subject: string, text: string, html: string) {
  const key = getResendApiKey();
  if (!key) {
    console.warn(
      "[notify-admin] RESEND_API_KEY is not set — email notifications disabled. Add it in .env.local / hosting env."
    );
    return false;
  }

  const from = getResendFromAddress();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [getAdminEmail()],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let logged = errText;
    try {
      const body = JSON.parse(errText) as { message?: string };
      if (body.message) logged = enrichResendError(body.message);
    } catch {
      /* use raw */
    }
    console.error("[notify-admin] Resend error:", res.status, logged);
    return false;
  }
  return true;
}

async function sendTelegramBot(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.warn(
      "[notify-admin] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing — Telegram bot alerts disabled. Create a bot with @BotFather, message it /start, then read chat_id from https://api.telegram.org/bot<TOKEN>/getUpdates"
    );
    return false;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    }
  );

  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!data.ok) {
    console.error("[notify-admin] Telegram API error:", data);
    return false;
  }
  return true;
}

async function sendCallMeBotWhatsApp(text: string) {
  const apikey = process.env.CALLMEBOT_API_KEY?.trim();
  if (!apikey) {
    console.warn(
      "[notify-admin] CALLMEBOT_API_KEY not set — WhatsApp API alerts disabled. See https://www.callmebot.com/blog/free-api-whatsapp-messages/"
    );
    return false;
  }

  const phone = getAdminWhatsappPhone();
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    phone
  )}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok || body.toLowerCase().includes("error")) {
    console.error("[notify-admin] CallMeBot error:", res.status, body);
    return false;
  }
  return true;
}

export async function notifyAdminNewAppointment(p: AppointmentNotifyPayload) {
  const text = formatAppointmentMessage(p);
  const subject = `[Eagle Medical] New appointment — ${p.patient_name}`;
  const html = `
    <h2>New appointment</h2>
    <p><strong>Doctor:</strong> ${escapeHtml(p.doctor_name)}</p>
    <p><strong>Patient:</strong> ${escapeHtml(p.patient_name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(p.phone)}</p>
    <p><strong>Patient Telegram:</strong> ${escapeHtml(p.telegram)}</p>
    <p><strong>Location:</strong> ${escapeHtml(p.country)} / ${escapeHtml(p.city)}</p>
    <p><strong>Reason:</strong> ${escapeHtml(p.disease)}</p>
    <p><strong>Consult:</strong> ${escapeHtml(p.consult_type)}</p>
    <hr />
    <p><small>Admin contacts: ${escapeHtml(getAdminTelegramDisplay())} · WhatsApp +${escapeHtml(getAdminWhatsappPhone())}</small></p>
  `;

  await Promise.allSettled([
    sendResendEmail(subject, text, html),
    sendTelegramBot(text),
    sendCallMeBotWhatsApp(text),
  ]);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
