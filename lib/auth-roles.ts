import type { User } from "@supabase/supabase-js";

export type UserRole = "patient" | "doctor" | "admin";

type Meta = Record<string, unknown> | undefined;

export function getRoleFromMetadata(metadata: Meta): UserRole | null {
  const role = metadata?.role;
  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }
  return null;
}

/**
 * Admin check — ONLY app_metadata.role === "admin".
 * app_metadata can only be set with the service role / SQL, not by the client.
 * Never trust user_metadata for admin.
 */
export function isAdminUser(
  user: Pick<User, "app_metadata"> | null | undefined
): boolean {
  return user?.app_metadata?.role === "admin";
}

/** @deprecated Prefer isAdminUser(user). Kept for metadata-shaped checks of app_metadata only. */
export function isAdminRole(metadata: Meta): boolean {
  return metadata?.role === "admin";
}
