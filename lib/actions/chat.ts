"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { formatLastMessagePreview } from "../chat-display";
import type {
  ConversationWithMeta,
  Message,
  MessageType,
} from "../types/chat";

function doctorDisplayName(row: {
  name?: string | null;
  name_en?: string | null;
}) {
  return row.name_en?.trim() || row.name?.trim() || "Doctor";
}

async function resolvePatientName(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  patientId: string,
  doctorId: string,
  appointmentId: string | null
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", patientId)
    .maybeSingle();

  const profileName = profile?.full_name?.trim();
  if (profileName && profileName.toLowerCase() !== "patient") {
    return profileName;
  }

  if (appointmentId) {
    const { data: apt } = await supabase
      .from("appointments")
      .select("patient_name")
      .eq("id", appointmentId)
      .maybeSingle();
    if (apt?.patient_name?.trim()) return apt.patient_name.trim();
  }

  const { data: latestApt } = await supabase
    .from("appointments")
    .select("patient_name")
    .eq("user_id", patientId)
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latestApt?.patient_name?.trim() || profileName || "Patient";
}

export async function getOrCreateConversation(
  doctorId: string,
  appointmentId?: string
): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not logged in" };

  return ensureConversation(supabase, doctorId, user.id, appointmentId);
}

export async function ensureConversationForBooking(
  doctorId: string,
  patientId: string,
  appointmentId: string
): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
  const supabase = createServiceClient() ?? (await createClient());
  if (!supabase) return { ok: false, error: "Not configured" };

  return ensureConversation(supabase, doctorId, patientId, appointmentId);
}

async function ensureConversation(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  doctorId: string,
  patientId: string,
  appointmentId?: string
): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id, appointment_id")
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId)
    .maybeSingle();

  if (existing) {
    if (appointmentId && existing.appointment_id !== appointmentId) {
      await supabase
        .from("conversations")
        .update({ appointment_id: appointmentId })
        .eq("id", existing.id);
    }
    return { ok: true, conversationId: existing.id };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  if (!created?.id) {
    return { ok: false, error: "Could not create conversation" };
  }
  return { ok: true, conversationId: created.id };
}

export async function getPatientConversations(): Promise<ConversationWithMeta[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: convos } = await supabase
    .from("conversations")
    .select("*")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (!convos) return [];

  const result: ConversationWithMeta[] = [];
  for (const c of convos) {
    const { data: doctorRow } = await supabase
      .from("doctors")
      .select("name, name_en, specialization, specialization_en")
      .eq("id", c.doctor_id)
      .maybeSingle();

    const { data: lastMsg } = await supabase
      .from("messages")
      .select("content, message_type, created_at")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", c.id)
      .neq("sender_id", user.id)
      .is("read_at", null);

    const specialization =
      doctorRow?.specialization_en?.trim() ||
      doctorRow?.specialization?.trim() ||
      "";

    result.push({
      id: c.id,
      patient_id: c.patient_id,
      doctor_id: c.doctor_id,
      appointment_id: c.appointment_id,
      created_at: c.created_at,
      doctor_name: doctorRow ? doctorDisplayName(doctorRow) : "Doctor",
      doctor_specialization: specialization,
      last_message: formatLastMessagePreview(
        lastMsg?.content,
        lastMsg?.message_type as MessageType | undefined
      ),
      last_message_type: lastMsg?.message_type as MessageType | undefined,
      unread_count: count ?? 0,
    });
  }

  return result;
}

export async function getDoctorConversations(
  doctorId: string
): Promise<ConversationWithMeta[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: convos } = await supabase
    .from("conversations")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (!convos) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result: ConversationWithMeta[] = [];
  for (const c of convos) {
    const patientName = await resolvePatientName(
      supabase,
      c.patient_id,
      doctorId,
      c.appointment_id
    );

    const { data: lastMsg } = await supabase
      .from("messages")
      .select("content, message_type")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", c.id)
      .neq("sender_id", user?.id ?? "")
      .is("read_at", null);

    result.push({
      ...c,
      patient_name: patientName,
      last_message: formatLastMessagePreview(
        lastMsg?.content,
        lastMsg?.message_type as MessageType | undefined
      ),
      last_message_type: lastMsg?.message_type as MessageType | undefined,
      unread_count: count ?? 0,
    });
  }

  return result;
}

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (data) {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  }

  return (data as Message[]) ?? [];
}

async function resolveSenderRole(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  conversationId: string
): Promise<"patient" | "doctor" | null> {
  const { data: convo } = await supabase
    .from("conversations")
    .select("patient_id, doctor_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!convo) return null;
  if (convo.patient_id === userId) return "patient";

  const { data: doctor } = await supabase
    .from("doctors")
    .select("auth_user_id")
    .eq("id", convo.doctor_id)
    .maybeSingle();

  if (doctor?.auth_user_id === userId) return "doctor";
  return null;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  _senderRole: "patient" | "doctor",
  messageType: MessageType = "text",
  attachmentUrl?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not logged in" };

  const senderRole = await resolveSenderRole(supabase, user.id, conversationId);
  if (!senderRole) {
    return { ok: false, error: "You are not allowed to send in this chat" };
  }

  const trimmed = content.trim();
  if (!trimmed && messageType === "text") {
    return { ok: false, error: "Message cannot be empty" };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: senderRole,
    content: trimmed || (messageType === "image" ? "Photo" : "Call"),
    message_type: messageType,
    attachment_url: attachmentUrl ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/chat");
  return { ok: true };
}

export async function getDoctorAppointments(doctorId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
