import { createClient } from "./supabase/client";

export const CHAT_IMAGES_BUCKET = "chat-images";

/** Signed URL lifetime — 2 hours. */
export const CHAT_IMAGE_SIGNED_TTL_SEC = 60 * 60 * 2;

/**
 * Normalize a stored chat-image value to a plain storage path.
 * Handles plain paths and legacy public/signed URLs.
 */
export function extractChatImagePath(
  stored: string | null | undefined
): string | null {
  const value = (stored ?? "").trim();
  if (!value) return null;

  if (!value.includes("://")) {
    return value.replace(/^\/+/, "");
  }

  const markers = [
    `/object/public/${CHAT_IMAGES_BUCKET}/`,
    `/object/sign/${CHAT_IMAGES_BUCKET}/`,
    `/object/authenticated/${CHAT_IMAGES_BUCKET}/`,
  ];

  for (const marker of markers) {
    const idx = value.indexOf(marker);
    if (idx === -1) continue;
    const raw = value.slice(idx + marker.length).split("?")[0] ?? "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return null;
}

/**
 * Create a signed URL for a chat image (client-side).
 * The caller must be a conversation participant (enforced by RLS).
 */
export async function createChatImageSignedUrl(
  stored: string | null | undefined,
  expiresIn = CHAT_IMAGE_SIGNED_TTL_SEC
): Promise<string | null> {
  const path = extractChatImagePath(stored);
  if (!path) return null;

  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error("[chat-image] createSignedUrl failed:", error ?? "missing signedUrl", path);
    return null;
  }

  return data.signedUrl;
}
