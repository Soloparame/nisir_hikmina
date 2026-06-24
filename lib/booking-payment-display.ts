import type { AppointmentPayment, BookingWithPayment } from "./types/payment";

/** Resolve payment info from appointment_payments row or appointment columns. */
export function resolveBookingPayment(
  booking: BookingWithPayment
): AppointmentPayment | null {
  if (booking.payment?.screenshot_url) {
    return booking.payment;
  }

  const screenshot =
    booking.payment_screenshot_url?.trim() ||
    booking.payment?.screenshot_url?.trim();
  if (!screenshot) {
    return booking.payment ?? null;
  }

  const method =
    booking.payment?.method ??
    booking.payment_method ??
    "telebirr";

  return {
    id: booking.payment?.id ?? `appt-${booking.id}`,
    appointment_id: booking.id,
    method: method === "cbe" ? "cbe" : "telebirr",
    amount_etb: booking.payment?.amount_etb ?? booking.amount_etb ?? 0,
    screenshot_url: screenshot,
    status: booking.payment?.status ?? "pending_review",
    reviewed_by: booking.payment?.reviewed_by ?? null,
    reviewed_at: booking.payment?.reviewed_at ?? null,
    admin_notes: booking.payment?.admin_notes ?? null,
    created_at: booking.payment?.created_at ?? booking.created_at,
  };
}

export function getBookingScreenshotUrl(booking: BookingWithPayment): string | null {
  return resolveBookingPayment(booking)?.screenshot_url ?? null;
}
