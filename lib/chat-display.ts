import type { MessageType } from "./types/chat";

export function formatLastMessagePreview(
  content: string | undefined,
  type?: MessageType
): string {
  if (!content && type === "image") return "📷 Photo";
  if (type === "image") return "📷 Photo";
  if (type === "call_video") return "📹 Video call";
  if (type === "call_audio") return "📞 Audio call";
  return content ?? "";
}
