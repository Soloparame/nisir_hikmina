"use server";

import { createServiceClient } from "../supabase/admin";
import { validateDoctorLogin } from "./auth";

export type DoctorActivateResult = {
  ok: boolean;
  error?: string;
  /** Client should finish with signInWithPassword + link */
  readyForSignIn?: boolean;
};

async function findAuthUserIdByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: { auth: { admin: any } },
  email: string
): Promise<string | null> {
  const target = email.trim().toLowerCase();

  // Prefer filtered admin lookup when supported by the Auth API
  try {
    const filtered = await service.auth.admin.listUsers({
      page: 1,
      perPage: 50,
      email: target,
    });
    const hit = filtered.data?.users?.find(
      (u: { email?: string | null }) => u.email?.toLowerCase() === target
    );
    if (hit?.id) return hit.id as string;
  } catch {
    // fall through to paginated scan
  }

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      console.error("findAuthUserIdByEmail:", error.message);
      return null;
    }
    const hit = data.users.find(
      (u: { email?: string | null }) => u.email?.toLowerCase() === target
    );
    if (hit?.id) return hit.id;
    if (data.users.length < 200) break;
  }

  return null;
}

/**
 * First-time doctor password activation.
 * Creates / confirms the Auth user with the password they choose so
 * email-confirmation settings cannot block login. Google OAuth remains separate.
 */
export async function activateDoctorFirstLogin(data: {
  login_code: string;
  email: string;
  password: string;
}): Promise<DoctorActivateResult> {
  const password = data.password;
  if (!password || password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const validation = await validateDoctorLogin(data.login_code, data.email);
  if (!validation.ok) {
    return { ok: false, error: validation.error ?? "Invalid doctor login." };
  }

  // Returning doctors: nothing to activate — client should sign in normally
  if (!validation.isFirstLogin) {
    return { ok: true, readyForSignIn: true };
  }

  const service = createServiceClient();
  if (!service) {
    // No service role — client will fall back to signUp flow
    return { ok: true, readyForSignIn: false };
  }

  const email = data.email.trim().toLowerCase();
  const code = data.login_code.trim().toUpperCase();
  const fullName = validation.doctorName ?? "Doctor";

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "doctor",
        full_name: fullName,
        login_code: code,
      },
    });

  if (!createError && created.user) {
    return { ok: true, readyForSignIn: true };
  }

  const createMsg = createError?.message?.toLowerCase() ?? "";
  const alreadyExists =
    createMsg.includes("already") ||
    createMsg.includes("registered") ||
    createMsg.includes("exists");

  if (!alreadyExists) {
    return {
      ok: false,
      error: createError?.message ?? "Could not activate doctor account.",
    };
  }

  // Email already in Auth (e.g. incomplete signup). Set password + confirm for first activation.
  const userId = await findAuthUserIdByEmail(service, email);
  if (!userId) {
    return {
      ok: false,
      error:
        "This email already has an account, but it could not be activated automatically. Use Continue with Google, or ask admin to clear the Auth user and try again.",
    };
  }

  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "patient" || profile?.role === "admin") {
    return {
      ok: false,
      error:
        "This email is already used by another account type. Ask the admin to use a different doctor email.",
    };
  }

  const { error: updateError } = await service.auth.admin.updateUserById(
    userId,
    {
      password,
      email_confirm: true,
      user_metadata: {
        role: "doctor",
        full_name: fullName,
        login_code: code,
      },
    }
  );

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true, readyForSignIn: true };
}
