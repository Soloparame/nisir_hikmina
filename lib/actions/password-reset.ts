"use server";

import { validateDoctorLogin } from "./auth";
import { sendPasswordResetEmail } from "../notify-password-reset";

export async function requestPatientPasswordReset(email: string) {
  return sendPasswordResetEmail({
    email,
    nextPath: "/reset-password/update",
  });
}

export async function requestDoctorPasswordReset(
  loginCode: string,
  email: string
) {
  const code = loginCode.trim().toUpperCase();
  const validation = await validateDoctorLogin(code, email);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error ?? "Invalid doctor account." };
  }

  return sendPasswordResetEmail({
    email,
    nextPath: `/doctor/${code}/reset-password/update`,
  });
}
