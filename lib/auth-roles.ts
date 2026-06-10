export type UserRole = "patient" | "doctor" | "admin";

export function getRoleFromMetadata(
  metadata: Record<string, unknown> | undefined
): UserRole | null {
  const role = metadata?.role;
  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }
  return null;
}

export function isAdminRole(
  metadata: Record<string, unknown> | undefined
): boolean {
  const role = getRoleFromMetadata(metadata);
  if (role === "admin") return true;
  if (role === "patient" || role === "doctor") return false;
  return true;
}
