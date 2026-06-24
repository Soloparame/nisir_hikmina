"use server";

import { revalidatePath } from "next/cache";
import { isAdminRole } from "../auth-roles";
import { notifyAdminNewAppointment } from "../notify-admin-appointment";
import { resolveBookingPayment } from "../booking-payment-display";
import { createServiceClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import type { BookingPaymentInsert, BookingWithPayment } from "../types/payment";
import { ensureConversationForBooking } from "./chat";

async function getAuthedAdminClient() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminRole(user.user_metadata as Record<string, unknown>)) {
    throw new Error("Admin access required");
  }

  const service = createServiceClient();
  return { supabase: service ?? supabase, user, usingServiceRole: Boolean(service) };
}

function normalizeScheduledTime(time: string): string {
  const hhmm = time.trim().slice(0, 5);
  return `${hhmm}:00`;
}

function normalizeTimeForCompare(time: string): string {
  return time.trim().slice(0, 5);
}

export async function getBookedTimesForDoctor(
  doctorId: string,
  date: string
): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select("scheduled_time")
    .eq("doctor_id", doctorId)
    .eq("scheduled_date", date)
    .in("status", ["pending_payment", "confirmed"]);

  if (error) {
    console.error("getBookedTimesForDoctor:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const t = row.scheduled_time as string | null;
      return t ? normalizeTimeForCompare(t) : null;
    })
    .filter((t): t is string => Boolean(t));
}

async function isSlotAlreadyBooked(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  doctorId: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<boolean> {
  const timeValue = normalizeScheduledTime(scheduledTime);
  const { data, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("scheduled_date", scheduledDate)
    .eq("scheduled_time", timeValue)
    .in("status", ["pending_payment", "confirmed"])
    .maybeSingle();

  if (error) {
    console.error("isSlotAlreadyBooked:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function createBookingWithPayment(
  data: BookingPaymentInsert
): Promise<{ ok: boolean; error?: string; appointmentId?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const patientUserId = data.user_id ?? user?.id ?? null;
  const scheduledTimeDb = normalizeScheduledTime(data.scheduled_time);

  const slotTaken = await isSlotAlreadyBooked(
    supabase,
    data.doctor_id,
    data.scheduled_date,
    data.scheduled_time
  );
  if (slotTaken) {
    return {
      ok: false,
      error: "That time slot was just booked. Please choose another time.",
    };
  }

  const appointmentPayload = {
    doctor_id: data.doctor_id,
    patient_name: data.patient_name,
    phone: data.phone,
    disease: data.disease,
    telegram: data.telegram?.trim() || "—",
    country: data.country,
    city: data.city,
    consult_type: data.consult_type,
    consult_type_key: data.consult_type_key,
    user_id: patientUserId,
    availability_period: data.availability_period ?? null,
    availability_time: data.availability_time ?? null,
    scheduled_date: data.scheduled_date,
    scheduled_time: scheduledTimeDb,
    amount_etb: data.amount_etb,
    payment_screenshot_url: data.screenshot_url,
    payment_method: data.payment_method,
    status: "pending_payment",
  };

  let inserted: { id: string } | null = null;
  let appointmentError: { message: string; code?: string } | null = null;

  const primary = await supabase
    .from("appointments")
    .insert(appointmentPayload)
    .select("id")
    .single();

  inserted = primary.data;
  appointmentError = primary.error;

  if (
    appointmentError?.message?.includes("payment_screenshot_url") ||
    appointmentError?.message?.includes("payment_method")
  ) {
    const { payment_screenshot_url: _s, payment_method: _m, ...legacyPayload } =
      appointmentPayload;
    const fallback = await supabase
      .from("appointments")
      .insert(legacyPayload)
      .select("id")
      .single();
    inserted = fallback.data;
    appointmentError = fallback.error;
  }

  if (appointmentError || !inserted) {
    console.error(
      "createBookingWithPayment:",
      appointmentError?.message ?? "Insert failed"
    );
    if (appointmentError?.code === "23505") {
      return {
        ok: false,
        error: "That time slot was just booked. Please choose another time.",
      };
    }
    return {
      ok: false,
      error: appointmentError?.message ?? "Could not create booking",
    };
  }

  const paymentDb = createServiceClient() ?? supabase;
  const { error: paymentError } = await paymentDb
    .from("appointment_payments")
    .insert({
      appointment_id: inserted.id,
      method: data.payment_method,
      amount_etb: data.amount_etb,
      screenshot_url: data.screenshot_url,
      status: "pending_review",
    });

  if (paymentError) {
    console.error("createBookingWithPayment payment:", paymentError.message);
    // Screenshot is already on appointments.payment_screenshot_url — booking still valid for admin review.
  }

  let doctorName = "Unknown doctor";
  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("name, name_en")
    .eq("id", data.doctor_id)
    .maybeSingle();
  if (doctorRow) {
    doctorName =
      (doctorRow as { name?: string; name_en?: string | null }).name_en?.trim() ||
      (doctorRow as { name?: string }).name ||
      doctorName;
  }

  try {
    await notifyAdminNewAppointment({
      patient_name: data.patient_name,
      phone: data.phone,
      disease: data.disease,
      telegram: data.telegram?.trim() || data.phone,
      country: data.country,
      city: data.city,
      consult_type: data.consult_type,
      doctor_name: doctorName,
      availability_time: data.availability_time,
    });
  } catch (e) {
    console.error("createBookingWithPayment notify:", e);
  }

  revalidatePath("/admin/bookings");
  return { ok: true, appointmentId: inserted.id };
}

export async function getAdminBookings(): Promise<BookingWithPayment[]> {
  const { supabase } = await getAuthedAdminClient();

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*, doctors(name, name_en)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("getAdminBookings appointments:", error.message);
    return [];
  }

  const rows = appointments ?? [];
  const appointmentIds = rows.map((row) => row.id as string);

  let paymentsByAppointment = new Map<string, BookingWithPayment["payment"]>();
  if (appointmentIds.length > 0) {
    const { data: payments, error: paymentError } = await supabase
      .from("appointment_payments")
      .select(
        "id, appointment_id, method, amount_etb, screenshot_url, status, reviewed_by, reviewed_at, admin_notes, created_at"
      )
      .in("appointment_id", appointmentIds);

    if (paymentError) {
      console.error("getAdminBookings payments:", paymentError.message);
    } else {
      for (const payment of payments ?? []) {
        paymentsByAppointment.set(payment.appointment_id, payment);
      }
    }
  }

  return rows.map((row) => {
    const doctor = row.doctors as
      | { name?: string; name_en?: string | null }
      | null
      | undefined;
    const { doctors: _d, ...appointment } = row;
    const merged: BookingWithPayment = {
      ...(appointment as BookingWithPayment),
      doctor_name: doctor?.name_en?.trim() || doctor?.name || null,
      payment: paymentsByAppointment.get(row.id as string) ?? null,
    };
    return {
      ...merged,
      payment: resolveBookingPayment(merged),
    };
  });
}

export async function approveBookingPayment(
  appointmentId: string
): Promise<{ ok: boolean; error?: string; chatEnabled?: boolean }> {
  try {
    const { supabase, user } = await getAuthedAdminClient();

    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, doctor_id, user_id, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (fetchError || !appointment) {
      return { ok: false, error: fetchError?.message ?? "Booking not found" };
    }

    if (appointment.status === "confirmed") {
      return { ok: true, chatEnabled: Boolean(appointment.user_id) };
    }

    const now = new Date().toISOString();

    const { data: existingPayment } = await supabase
      .from("appointment_payments")
      .select("id, status")
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    if (existingPayment?.status === "rejected") {
      return {
        ok: false,
        error: "Payment was rejected. Cannot confirm this booking.",
      };
    }

    if (existingPayment && existingPayment.status === "pending_review") {
      const { error: paymentError } = await supabase
        .from("appointment_payments")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: now,
        })
        .eq("id", existingPayment.id);

      if (paymentError) {
        console.error("approveBookingPayment payment:", paymentError.message);
      }
    }

    const { error: appointmentError } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointmentId);

    if (appointmentError) {
      return { ok: false, error: appointmentError.message };
    }

    let chatEnabled = false;
    if (appointment.user_id && appointment.doctor_id) {
      try {
        const convo = await ensureConversationForBooking(
          appointment.doctor_id,
          appointment.user_id,
          appointmentId
        );
        chatEnabled = Boolean(convo.ok);
        if (!convo.ok) {
          console.error("approveBookingPayment chat:", convo.error);
        }
      } catch (chatErr) {
        console.error("approveBookingPayment chat:", chatErr);
      }
    }

    try {
      revalidatePath("/admin/bookings");
      revalidatePath("/book");
      revalidatePath("/chat");
    } catch (revalidateErr) {
      console.error("approveBookingPayment revalidate:", revalidateErr);
    }

    return { ok: true, chatEnabled };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to approve payment",
    };
  }
}

export async function rejectBookingPayment(
  appointmentId: string,
  adminNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthedAdminClient();
    const now = new Date().toISOString();

    const { error: paymentError } = await supabase
      .from("appointment_payments")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: now,
        admin_notes: adminNotes?.trim() || null,
      })
      .eq("appointment_id", appointmentId)
      .eq("status", "pending_review");

    if (paymentError) {
      return { ok: false, error: paymentError.message };
    }

    const { error: appointmentError } = await supabase
      .from("appointments")
      .update({ status: "payment_rejected" })
      .eq("id", appointmentId);

    if (appointmentError) {
      return { ok: false, error: appointmentError.message };
    }

    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to reject payment",
    };
  }
}
