import type { User } from "@supabase/supabase-js";

export function getUserRole(
  user: User | null | undefined
): "patient" | "doctor" | "admin" | null {
  if (!user) return null;
  const role = user.user_metadata?.role;
  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }
  return null;
}

/** Patient portal: profile, chat, patient booking */
export function isPatientUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = getUserRole(user);
  if (role === "doctor" || role === "admin") return false;
  return true;
}

export function isDoctorUser(user: User | null | undefined): boolean {
  return getUserRole(user) === "doctor";
}
