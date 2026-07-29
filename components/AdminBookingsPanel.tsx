"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveBookingPayment,
  rejectBookingPayment,
} from "../lib/actions/bookings";
import { getBookingScreenshotUrl } from "../lib/booking-payment-display";
import type { BookingWithPayment } from "../lib/types/payment";
import styles from "./AdminBookingsPanel.module.css";

type Props = {
  initialBookings: BookingWithPayment[];
  loadError?: string | null;
};

function formatSchedule(b: BookingWithPayment) {
  if (b.scheduled_date && b.scheduled_time) {
    const time = String(b.scheduled_time).slice(0, 5);
    return `${b.scheduled_date} · ${time}`;
  }
  return b.availability_time ?? "—";
}

function statusLabel(status: string) {
  switch (status) {
    case "pending_payment":
      return "Awaiting review";
    case "pending":
      return "Awaiting review";
    case "confirmed":
      return "Confirmed — active";
    case "payment_rejected":
      return "Payment rejected";
    default:
      return status.replace(/_/g, " ");
  }
}

function statusClass(status: string) {
  if (status === "confirmed") return styles.statusConfirmed;
  if (status === "pending_payment" || status === "pending") {
    return styles.statusPending;
  }
  if (status === "payment_rejected") return styles.statusRejected;
  return styles.statusDefault;
}

function paymentStatusLabel(status?: string) {
  switch (status) {
    case "pending_review":
      return "Screenshot pending review";
    case "approved":
      return "Payment approved";
    case "rejected":
      return "Payment rejected";
    default:
      return status ?? "No payment record";
  }
}

function canConfirm(b: BookingWithPayment) {
  if (b.status === "confirmed" || b.status === "payment_rejected") return false;
  if (b.payment?.status === "approved" || b.payment?.status === "rejected") {
    return false;
  }
  return (
    b.status === "pending_payment" ||
    b.status === "pending" ||
    b.payment?.status === "pending_review" ||
    !b.payment
  );
}

function PaymentScreenshot({ url }: { url: string }) {
  // Paths (private bucket) are not viewable; only signed https URLs work.
  if (!url.startsWith("http")) {
    return (
      <div className={styles.screenshotBlock}>
        <p className={styles.screenshotLabel}>Payment screenshot</p>
        <p className={styles.screenshotHint}>
          Screenshot stored privately. Refresh the page after deploying the
          private-bucket update, or open again so a signed link can be created.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.screenshotBlock}>
      <p className={styles.screenshotLabel}>Payment screenshot</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.screenshotLink}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Payment screenshot" className={styles.screenshot} />
        <span className={styles.screenshotHint}>Click to open full size</span>
      </a>
    </div>
  );
}

function BookingDetails({
  booking,
  showPayment = true,
}: {
  booking: BookingWithPayment;
  showPayment?: boolean;
}) {
  return (
    <dl className={styles.details}>
      <div>
        <dt>Patient</dt>
        <dd>{booking.patient_name}</dd>
      </div>
      <div>
        <dt>Doctor</dt>
        <dd>{booking.doctor_name ?? "—"}</dd>
      </div>
      <div>
        <dt>Condition</dt>
        <dd>{booking.disease}</dd>
      </div>
      <div>
        <dt>Consultation</dt>
        <dd>{booking.consult_type}</dd>
      </div>
      <div>
        <dt>Schedule</dt>
        <dd>{formatSchedule(booking)}</dd>
      </div>
      <div>
        <dt>Location</dt>
        <dd>
          {[booking.city, booking.country].filter(Boolean).join(", ") || "—"}
        </dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd>{booking.phone}</dd>
      </div>
      <div>
        <dt>Telegram</dt>
        <dd>{booking.telegram}</dd>
      </div>
      <div>
        <dt>Patient account</dt>
        <dd>
          {booking.user_id ? (
            <span className={styles.accountOk}>Signed in — chat can open</span>
          ) : (
            <span className={styles.accountWarn}>
              Not linked — booking can still be confirmed, but chat needs a
              signed-in patient
            </span>
          )}
        </dd>
      </div>
      {showPayment && (
        <>
          <div>
            <dt>Amount</dt>
            <dd>
              {booking.amount_etb != null ? `${booking.amount_etb} ETB` : "—"}
            </dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>{booking.payment?.method?.toUpperCase() ?? "—"}</dd>
          </div>
          <div>
            <dt>Payment status</dt>
            <dd>{paymentStatusLabel(booking.payment?.status)}</dd>
          </div>
        </>
      )}
    </dl>
  );
}

function ConfirmActions({
  bookingId,
  busyId,
  onApprove,
  onReject,
}: {
  bookingId: string;
  busyId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.approveBtn}
        disabled={busyId === bookingId}
        onClick={() => onApprove(bookingId)}
      >
        {busyId === bookingId ? "Confirming…" : "Confirm booking (activate)"}
      </button>
      <button
        type="button"
        className={styles.rejectBtn}
        disabled={busyId === bookingId}
        onClick={() => onReject(bookingId)}
      >
        Reject payment
      </button>
    </div>
  );
}

export default function AdminBookingsPanel({
  initialBookings,
  loadError,
}: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const pending = bookings.filter(canConfirm);

  async function handleApprove(id: string) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const result = await approveBookingPayment(id);
      if (!result || typeof result.ok !== "boolean") {
        setError(
          "Confirm failed — server did not respond. Refresh the page and try again."
        );
        return;
      }
      if (!result.ok) {
        setError(result.error ?? "Failed to confirm booking");
        return;
      }
      setMessage(
        result.chatEnabled
          ? "Booking confirmed and activated. Doctor and patient can now chat."
          : "Booking confirmed and activated for the doctor. Chat will work once the patient books while signed in."
      );
      router.refresh();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "confirmed",
                payment: b.payment
                  ? { ...b.payment, status: "approved" }
                  : b.payment,
              }
            : b
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Confirm failed. Check your connection and try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    const notes = window.prompt("Optional note for the patient/admin record:");
    if (notes === null) return;

    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const result = await rejectBookingPayment(id, notes || undefined);
      if (!result || typeof result.ok !== "boolean") {
        setError("Reject failed — server did not respond. Try again.");
        return;
      }
      if (!result.ok) {
        setError(result.error ?? "Failed to reject payment");
        return;
      }
      setMessage("Payment rejected. Booking stays inactive.");
      router.refresh();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "payment_rejected",
                payment: b.payment
                  ? { ...b.payment, status: "rejected" }
                  : b.payment,
              }
            : b
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Reject failed. Try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Bookings & payments</h1>
          <p>
            Open each booking to see patient details and the payment screenshot,
            then click Confirm to set status to active for the doctor.
          </p>
        </div>
        <span className={styles.badge}>{pending.length} awaiting review</span>
      </header>

      <div className={styles.steps}>
        <span>1. Review patient info + screenshot</span>
        <span>2. Confirm booking (status → active)</span>
        <span>3. Doctor sees active patient on their dashboard</span>
      </div>

      {loadError && (
        <p className={styles.error}>
          {loadError}
          {" — "}
          Run migration-v12, v14, and v15 in Supabase SQL Editor if payments
          do not load.
        </p>
      )}
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2>Pending payment review</h2>
        {pending.length === 0 ? (
          <p className={styles.empty}>
            No bookings waiting for confirmation. Check All bookings below and
            click Details on any row.
          </p>
        ) : (
          <div className={styles.grid}>
            {pending.map((b) => (
              <article key={b.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <strong>{b.patient_name}</strong>
                    <p>{b.doctor_name ?? "Doctor"}</p>
                  </div>
                  <span className={`${styles.status} ${statusClass(b.status)}`}>
                    {statusLabel(b.status)}
                  </span>
                </div>

                <BookingDetails booking={b} />

                {getBookingScreenshotUrl(b) ? (
                  <PaymentScreenshot url={getBookingScreenshotUrl(b)!} />
                ) : (
                  <p className={styles.missingShot}>
                    No payment screenshot stored yet. Run migration-v15 in
                    Supabase, then submit a new test booking with a screenshot.
                  </p>
                )}

                <ConfirmActions
                  bookingId={b.id}
                  busyId={busyId}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>All bookings</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Schedule</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <Fragment key={b.id}>
                    <tr>
                      <td>{b.patient_name}</td>
                      <td>{b.doctor_name ?? "—"}</td>
                      <td>{formatSchedule(b)}</td>
                      <td>
                        {b.amount_etb != null ? `${b.amount_etb} ETB` : "—"}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${statusClass(b.status)}`}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.detailBtn}
                          onClick={() =>
                            setExpandedId(expandedId === b.id ? null : b.id)
                          }
                        >
                          {expandedId === b.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === b.id && (
                      <tr className={styles.detailRow}>
                        <td colSpan={6}>
                          <div className={styles.detailPanel}>
                            <BookingDetails booking={b} />
                            {getBookingScreenshotUrl(b) ? (
                              <PaymentScreenshot url={getBookingScreenshotUrl(b)!} />
                            ) : (
                              <p className={styles.missingShot}>
                                No payment screenshot stored for this booking.
                              </p>
                            )}
                            {canConfirm(b) && (
                              <ConfirmActions
                                bookingId={b.id}
                                busyId={busyId}
                                onApprove={handleApprove}
                                onReject={handleReject}
                              />
                            )}
                            {b.status === "confirmed" && (
                              <p className={styles.confirmedNote}>
                                Active — doctor dashboard shows this patient as
                                confirmed. Open Messages to chat (if patient was
                                signed in when booking).
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
