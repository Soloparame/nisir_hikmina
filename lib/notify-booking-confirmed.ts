import { sendTransactionalEmail } from "./send-email";
import { getDoctorLoginUrl } from "./site-url";

type BookingConfirmedEmailPayload = {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorLoginCode?: string | null;
  doctorSpecialization?: string | null;
  consultType: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSchedule(date?: string | null, time?: string | null) {
  const parts = [date?.trim(), time?.trim().slice(0, 5)].filter(Boolean);
  return parts.length > 0 ? parts.join(" at ") : null;
}

export async function notifyBookingConfirmed(
  payload: BookingConfirmedEmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const patientEmail = payload.patientEmail.trim();
  const doctorEmail = payload.doctorEmail.trim();

  if (!patientEmail || !doctorEmail) {
    return {
      ok: false,
      error: "Patient or doctor email is missing.",
    };
  }

  const schedule = formatSchedule(payload.scheduledDate, payload.scheduledTime);
  const loginUrl = payload.doctorLoginCode
    ? getDoctorLoginUrl(payload.doctorLoginCode)
    : null;

  const patientText = [
    `Hello ${payload.patientName},`,
    "",
    "Your payment has been successfully confirmed.",
    "You can now start your consultation by opening the Messages section and sending your message about your condition.",
    "",
    `Doctor: ${payload.doctorName}`,
    `Consultation type: ${payload.consultType}`,
    ...(schedule ? [`Schedule: ${schedule}`] : []),
    "",
    "Thank you for using Eagle Medical.",
    "",
    "— Eagle Medical",
  ].join("\n");

  const patientHtml = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px;">
      <h2 style="color: #004d4d; margin-bottom: 0.35rem;">Payment confirmed</h2>
      <p>Hello <strong>${escapeHtml(payload.patientName)}</strong>,</p>
      <p>Your payment has been <strong>successfully confirmed</strong>.</p>
      <p>You can now start your consultation by opening the <strong>Messages</strong> section and sending your message about your condition.</p>
      <div style="background: #f4fbf8; border: 1px solid #d1fae5; border-radius: 12px; padding: 1rem 1.15rem; margin: 1.25rem 0;">
        <p style="margin: 0 0 0.45rem;"><strong>Doctor</strong><br />${escapeHtml(payload.doctorName)}</p>
        <p style="margin: 0 0 0.45rem;"><strong>Consultation type</strong><br />${escapeHtml(payload.consultType)}</p>
        ${
          schedule
            ? `<p style="margin: 0;"><strong>Schedule</strong><br />${escapeHtml(schedule)}</p>`
            : ""
        }
      </div>
      <p>Thank you for using Eagle Medical.</p>
      <p style="margin-top: 1.5rem;">— Eagle Medical</p>
    </div>
  `;

  const doctorText = [
    `Hello ${payload.doctorName},`,
    "",
    "A patient's payment has been confirmed and the patient is now awaiting you.",
    "Please open your Messages section and start the conversation.",
    "",
    `Patient: ${payload.patientName}`,
    ...(payload.doctorSpecialization
      ? [`Specialty: ${payload.doctorSpecialization}`]
      : []),
    `Consultation type: ${payload.consultType}`,
    ...(schedule ? [`Schedule: ${schedule}`] : []),
    ...(loginUrl ? ["", `Doctor portal: ${loginUrl}`] : []),
    "",
    "— Eagle Medical",
  ].join("\n");

  const doctorHtml = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #0f172a; max-width: 560px;">
      <h2 style="color: #004d4d; margin-bottom: 0.35rem;">Patient awaiting your consultation</h2>
      <p>Hello <strong>${escapeHtml(payload.doctorName)}</strong>,</p>
      <p>A patient's payment has been confirmed and the patient is now awaiting you.</p>
      <p>Please open your <strong>Messages</strong> section and start the conversation.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem 1.15rem; margin: 1.25rem 0;">
        <p style="margin: 0 0 0.45rem;"><strong>Patient</strong><br />${escapeHtml(payload.patientName)}</p>
        ${
          payload.doctorSpecialization
            ? `<p style="margin: 0 0 0.45rem;"><strong>Specialty</strong><br />${escapeHtml(payload.doctorSpecialization)}</p>`
            : ""
        }
        <p style="margin: 0 0 0.45rem;"><strong>Consultation type</strong><br />${escapeHtml(payload.consultType)}</p>
        ${
          schedule
            ? `<p style="margin: 0 0 0.45rem;"><strong>Schedule</strong><br />${escapeHtml(schedule)}</p>`
            : ""
        }
        ${
          loginUrl
            ? `<p style="margin: 0;"><strong>Doctor portal</strong><br /><a href="${escapeHtml(loginUrl)}" style="color: #009966;">${escapeHtml(loginUrl)}</a></p>`
            : ""
        }
      </div>
      <p style="margin-top: 1.5rem;">— Eagle Medical</p>
    </div>
  `;

  const [patientResult, doctorResult] = await Promise.all([
    sendTransactionalEmail({
      to: patientEmail,
      subject: "Your Eagle Medical payment has been confirmed",
      text: patientText,
      html: patientHtml,
    }),
    sendTransactionalEmail({
      to: doctorEmail,
      subject: "A patient is waiting for your consultation",
      text: doctorText,
      html: doctorHtml,
    }),
  ]);

  if (!patientResult.ok || !doctorResult.ok) {
    return {
      ok: false,
      error:
        patientResult.error ||
        doctorResult.error ||
        "Could not send confirmation emails.",
    };
  }

  return { ok: true };
}
