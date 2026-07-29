import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "../auth-roles";

/**
 * Effective portal role.
 * - admin comes only from app_metadata (not user-editable)
 * - patient / doctor come from user_metadata
 * - a claimed "admin" in user_metadata is ignored
 */
export function getUserRole(
  user: User | null | undefined
): "patient" | "doctor" | "admin" | null {
  if (!user) return null;

  if (isAdminUser(user)) return "admin";

  const role = user.user_metadata?.role;
  if (role === "patient" || role === "doctor") {
    return role;
  }

  return null;
}

/** Patient portal: profile, chat, patient booking */
export function isPatientUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return false;
  if (getUserRole(user) === "doctor") return false;
  return true;
}

export function isDoctorUser(user: User | null | undefined): boolean {
  return getUserRole(user) === "doctor";
}

export { isAdminUser };
