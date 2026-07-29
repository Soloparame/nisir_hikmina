export const PAYMENT_SCREENSHOTS_BUCKET = "payment-screenshots";

/** Signed URL lifetime for admin review (2 hours). */
export const PAYMENT_SCREENSHOT_SIGNED_TTL_SEC = 60 * 60 * 2;

/**
 * Normalize stored screenshot value to a storage object path.
 * Supports:
 * - plain path: `userId/file.jpg`
 * - legacy public URL: `.../object/public/payment-screenshots/...`
 * - signed/authenticated URLs: `.../object/sign|authenticated/payment-screenshots/...`
 */
export function extractPaymentScreenshotPath(
  stored: string | null | undefined
): string | null {
  const value = (stored ?? "").trim();
  if (!value) return null;

  if (!value.includes("://")) {
    return value.replace(/^\/+/, "");
  }

  const markers = [
    `/object/public/${PAYMENT_SCREENSHOTS_BUCKET}/`,
    `/object/sign/${PAYMENT_SCREENSHOTS_BUCKET}/`,
    `/object/authenticated/${PAYMENT_SCREENSHOTS_BUCKET}/`,
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

type StorageSigner = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number
      ) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
    };
  };
};

export async function createPaymentScreenshotSignedUrl(
  client: StorageSigner,
  stored: string | null | undefined,
  expiresIn = PAYMENT_SCREENSHOT_SIGNED_TTL_SEC
): Promise<string | null> {
  const path = extractPaymentScreenshotPath(stored);
  if (!path) return null;

  const { data, error } = await client.storage
    .from(PAYMENT_SCREENSHOTS_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error(
      "[payment-screenshot] createSignedUrl failed:",
      error ?? "missing signedUrl",
      path
    );
    return null;
  }

  return data.signedUrl;
}
