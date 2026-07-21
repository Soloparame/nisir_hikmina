"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import type { Profile } from "../types/profile";

export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  const meta = user.user_metadata ?? {};
  let role = (meta.role as string) || "patient";
  if (role !== "patient" && role !== "doctor" && role !== "admin") {
    role = "patient";
  }

  const { data: created } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role,
      full_name: (meta.full_name as string | undefined)?.trim() || null,
      phone: (meta.phone as string | undefined)?.trim() || null,
    })
    .select("*")
    .maybeSingle();

  return created as Profile | null;
}

export async function signOutUser() {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function getDoctorByLoginCode(loginCode: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("doctors")
    .select("id, name, name_en, email, login_code, auth_user_id")
    .eq("login_code", loginCode.toUpperCase())
    .maybeSingle();

  return data;
}

export async function getDoctorProfileForSession(loginCode: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("doctors")
    .select(
      "id, name, name_en, email, login_code, auth_user_id, category, specialization, specialization_en, bio, bio_en, image_url, experience_years, languages, is_active, pricing_tier, morning_start, morning_end, afternoon_start, afternoon_end, evening_start, evening_end, morning_days, afternoon_days, evening_days"
    )
    .eq("login_code", loginCode.toUpperCase())
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data;
}

/** Verify doctor ID + email match the admin-registered doctors row. */
export async function validateDoctorLogin(
  loginCode: string,
  email: string
): Promise<{
  ok: boolean;
  error?: string;
  doctorName?: string;
  isFirstLogin?: boolean;
}> {
  const supabase = createServiceClient() ?? (await createClient());
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const code = loginCode.trim().toUpperCase();
  if (!code) {
    return { ok: false, error: "Doctor ID is required" };
  }

  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("id, name, name_en, email, auth_user_id, is_active")
    .eq("login_code", code)
    .maybeSingle();

  if (error || !doctor) {
    return { ok: false, error: "Invalid Doctor ID" };
  }

  if (!doctor.is_active) {
    return { ok: false, error: "This doctor profile is not active" };
  }

  const doctorEmail = (doctor.email as string | null)?.trim().toLowerCase();
  const inputEmail = email.trim().toLowerCase();

  if (!doctorEmail) {
    return {
      ok: false,
      error: "Doctor email not set by admin. Contact administrator.",
    };
  }

  if (doctorEmail !== inputEmail) {
    return {
      ok: false,
      error: "Email does not match your registered doctor record",
    };
  }

  return {
    ok: true,
    doctorName:
      (doctor.name_en as string | null)?.trim() ||
      (doctor.name as string) ||
      "Doctor",
    isFirstLogin: !doctor.auth_user_id,
  };
}

/** @deprecated Use validateDoctorLogin */
export async function validateDoctorRegistration(
  loginCode: string,
  email: string
) {
  return validateDoctorLogin(loginCode, email);
}

/** Link logged-in doctor auth user to doctors row (after client sign-up/login). */
export async function linkDoctorAccount(
  loginCode: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not logged in" };
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

  await supabase.from("profiles").upsert({
    id: user.id,
    role: "doctor",
    doctor_id: doctor.id,
    full_name:
      (user.user_metadata?.full_name as string | undefined)?.trim() || null,
  });

  return { ok: true };
}

export async function updatePatientProfile(data: {
  full_name?: string;
  phone?: string;
  telegram?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not logged in" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim(),
      phone: data.phone?.trim(),
      telegram: data.telegram?.trim(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}
