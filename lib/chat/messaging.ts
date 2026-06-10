import { createClient } from "../supabase/client";
import type { Message, MessageType } from "../types/chat";

type SendResult = { ok: boolean; error?: string };

async function resolveSenderRole(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  userId: string,
  conversationId: string
): Promise<"patient" | "doctor" | null> {
  const { data: convo, error } = await supabase
    .from("conversations")
    .select("patient_id, doctor_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !convo) return null;

  if (convo.patient_id === userId) return "patient";

  const { data: doctor } = await supabase
    .from("doctors")
    .select("auth_user_id")
    .eq("id", convo.doctor_id)
    .maybeSingle();

  if (doctor?.auth_user_id === userId) return "doctor";

  return null;
}

export async function sendMessageClient(
  conversationId: string,
  content: string,
  messageType: MessageType = "text",
  attachmentUrl?: string | null
): Promise<SendResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Chat is not configured on this site." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Please sign in again to send messages." };
  }

  const senderRole = await resolveSenderRole(supabase, user.id, conversationId);
  if (!senderRole) {
    return {
      ok: false,
      error: "You are not allowed to send messages in this conversation.",
    };
  }

  const trimmed = content.trim();
  if (!trimmed && messageType === "text") {
    return { ok: false, error: "Message cannot be empty." };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: senderRole,
    content: trimmed || (messageType === "image" ? "Photo" : "Call"),
    message_type: messageType,
    attachment_url: attachmentUrl ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getMessagesClient(
  conversationId: string
): Promise<Message[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return data.map((m) => ({
    ...m,
    message_type: (m.message_type ?? "text") as MessageType,
    attachment_url: m.attachment_url ?? null,
  })) as Message[];
}
