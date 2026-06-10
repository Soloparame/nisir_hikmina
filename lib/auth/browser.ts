import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";

export type AuthResult = {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};

const STUCK_USER_HELP =
  "Your account exists in Auth but is not activated. In Supabase: Authentication → Users → find your email → Confirm user. Or delete that user and sign up again. (Turning off Confirm email only affects new signups.)";

function emailAlreadyRegistered(
  identities: { id: string }[] | undefined
): boolean {
  return Array.isArray(identities) && identities.length === 0;
}

function isEmailNotConfirmed(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  );
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many email attempts. Wait a few minutes, then try again.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "This email is already registered. Try signing in with the same password.";
  }
  if (isEmailNotConfirmed(message)) {
    return STUCK_USER_HELP;
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password.";
  }
  return message;
}

export async function ensureProfileForUser(user: User) {
  const supabase = createClient();
  if (!supabase) return;

  const meta = user.user_metadata ?? {};
  let role = (meta.role as string) || "patient";
  if (role !== "patient" && role !== "doctor" && role !== "admin") {
    role = "patient";
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    role,
    full_name: (meta.full_name as string | undefined)?.trim() || null,
    phone: (meta.phone as string | undefined)?.trim() || null,
  });
}

async function completeSignIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured on this site." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) };
  }

  if (data.user) {
    await ensureProfileForUser(data.user);
  }

  return { ok: true };
}

export async function signUpPatientClient(data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured on this site." };
  }

  const email = data.email.trim();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        role: "patient",
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || "",
      },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
    },
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered")
    ) {
      return completeSignIn(email, data.password);
    }
    return { ok: false, error: friendlyAuthError(error.message) };
  }

  if (emailAlreadyRegistered(authData.user?.identities)) {
    return completeSignIn(email, data.password);
  }

  if (!authData.user) {
    return { ok: false, error: "Sign up failed. Please try again." };
  }

  if (!authData.session) {
    return { ok: true, needsEmailConfirmation: true };
  }

  await ensureProfileForUser(authData.user);
  return { ok: true };
}

export async function signInPatientClient(
  email: string,
  password: string
): Promise<AuthResult> {
  return completeSignIn(email, password);
}

/**
 * Doctor login — no separate signup. Admin registers the doctor; they sign in
 * with Doctor ID + registered email + password (password set on first login).
 */
export async function loginDoctorClient(data: {
  login_code: string;
  email: string;
  password: string;
  doctorName?: string;
  isFirstLogin?: boolean;
}): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured on this site." };
  }

  const email = data.email.trim();
  const code = data.login_code.trim().toUpperCase();
  const fullName = data.doctorName?.trim() || "Doctor";

  const signIn = await supabase.auth.signInWithPassword({
    email,
    password: data.password,
  });

  if (!signIn.error && signIn.data.session) {
    const link = await linkDoctorAccountClient(code);
    if (!link.ok) return link;
    return { ok: true };
  }

  const signInMsg = signIn.error?.message?.toLowerCase() ?? "";
  const canActivate =
    signInMsg.includes("invalid login") ||
    signInMsg.includes("invalid credentials") ||
    signInMsg.includes("email not confirmed");

  if (!data.isFirstLogin) {
    return {
      ok: false,
      error: friendlyAuthError(
        signIn.error?.message ?? "Invalid email or password."
      ),
    };
  }

  if (!canActivate && signIn.error) {
    return { ok: false, error: friendlyAuthError(signIn.error.message) };
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        role: "doctor",
        full_name: fullName,
        login_code: code,
      },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/doctor/${code}/login`
          : undefined,
    },
  });

  if (signUpError) {
    if (
      signUpError.message.toLowerCase().includes("already") ||
      signUpError.message.toLowerCase().includes("registered")
    ) {
      const retry = await completeSignIn(email, data.password);
      if (!retry.ok) return retry;
      const link = await linkDoctorAccountClient(code);
      if (!link.ok) return link;
      return { ok: true };
    }
    return { ok: false, error: friendlyAuthError(signUpError.message) };
  }

  if (emailAlreadyRegistered(authData.user?.identities)) {
    const retry = await completeSignIn(email, data.password);
    if (!retry.ok) return retry;
    const link = await linkDoctorAccountClient(code);
    if (!link.ok) return link;
    return { ok: true };
  }

  if (!authData.user) {
    return { ok: false, error: "Login failed. Please try again." };
  }

  if (!authData.session) {
    return { ok: true, needsEmailConfirmation: true };
  }

  await ensureProfileForUser(authData.user);
  const link = await linkDoctorAccountClient(code);
  if (!link.ok) return link;
  return { ok: true };
}

export async function signOutClient() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function linkDoctorAccountClient(
  loginCode: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured on this site." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: STUCK_USER_HELP };
  }

  const code = loginCode.toUpperCase();
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id, email, auth_user_id")
    .eq("login_code", code)
    .maybeSingle();

  if (doctorError || !doctor) {
    return { ok: false, error: "Invalid doctor ID" };
  }

  const doctorEmail = (doctor.email as string | null)?.trim().toLowerCase();
  const userEmail = user.email?.trim().toLowerCase();

  if (!doctorEmail || !userEmail || doctorEmail !== userEmail) {
    return { ok: false, error: "Email does not match doctor record" };
  }

  if (doctor.auth_user_id && doctor.auth_user_id !== user.id) {
    return { ok: false, error: "This doctor account is linked to another user" };
  }

  if (!doctor.auth_user_id) {
    const { error: linkError } = await supabase
      .from("doctors")
      .update({ auth_user_id: user.id })
      .eq("id", doctor.id);

    if (linkError) {
      return { ok: false, error: linkError.message };
    }
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role: "doctor",
    doctor_id: doctor.id,
    full_name:
      (user.user_metadata?.full_name as string | undefined)?.trim() || null,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function loadProfileClient() {
  const supabase = createClient();
  if (!supabase) return { user: null, profile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  await ensureProfileForUser(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function updatePatientProfileClient(data: {
  full_name?: string;
  phone?: string;
  telegram?: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not logged in" };
  }

  await ensureProfileForUser(user);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim(),
      phone: data.phone?.trim(),
      telegram: data.telegram?.trim(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
