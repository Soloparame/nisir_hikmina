export type MessageType = "text" | "image" | "call_audio" | "call_video";

export type Conversation = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "patient" | "doctor";
  content: string;
  message_type: MessageType;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
};

export type ConversationWithMeta = Conversation & {
  doctor_name?: string;
  doctor_specialization?: string;
  patient_name?: string;
  last_message?: string;
  last_message_type?: MessageType;
  unread_count?: number;
};

export function getJitsiRoomId(conversationId: string) {
  return `nisirhealth_${conversationId.replace(/-/g, "")}`;
}
