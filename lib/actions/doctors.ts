"use server";

import { revalidatePath } from "next/cache";
import { isAdminRole } from "../auth-roles";
import { generateLoginCode } from "../doctor-availability";
import {
  duplicateDoctorMessage,
  findDuplicateDoctor,
} from "../doctor-duplicates";
import { notifyDoctorWelcome } from "../notify-doctor-welcome";
import { notifyAdminNewAppointment } from "../notify-admin-appointment";
import { createServiceClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import type {
  AppointmentInsert,
  Doctor,
  DoctorFormData,
  DoctorSelfProfileData,
} from "../types/doctor";
import {
  PUBLIC_DOCTOR_COLUMNS,
  PUBLIC_DOCTOR_COLUMNS_NO_DAYS,
  PUBLIC_DOCTOR_COLUMNS_WITH_TIER,
} from "../types/doctor";
import { sortDoctorsByTier } from "../consultation-pricing";

async function getAuthedClient() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured. Add keys to .env.local");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!isAdminRole(user.user_metadata as Record<string, unknown>)) {
    throw new Error("Admin access required");
  }

  return supabase;
}

export async function getActiveDoctors() {
  const supabase = await createClient();
  if (!supabase) return [];

  const primary = await supabase
    .from("doctors")
    .select(PUBLIC_DOCTOR_COLUMNS_WITH_TIER)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!primary.error) {
    return sortDoctorsByTier((primary.data as Doctor[] | null) ?? []);
  }

  if (
    primary.error.message?.includes("pricing_tier") ||
    primary.error.message?.includes("morning_days")
  ) {
    const fallback = await supabase
      .from("doctors")
      .select(PUBLIC_DOCTOR_COLUMNS_NO_DAYS)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fallback.error) {
      console.error("getActiveDoctors:", fallback.error.message);
      return [];
    }

    return sortDoctorsByTier((fallback.data as Doctor[] | null) ?? []);
  }

  console.error("getActiveDoctors:", primary.error.message);
  return [];
}

/** Featured on homepage even if below experience threshold. */
const HOMEPAGE_FEATURED_DOCTOR_NAMES = [
  "Bemulu Fasika",
  "Tadesse Fenat",
  "Temesgen Adugnaw",
];

function normalizeDoctorName(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isHomepageFeaturedDoctor(doctor: {
  name?: string | null;
  name_en?: string | null;
}) {
  const names = [
    normalizeDoctorName(doctor.name),
    normalizeDoctorName(doctor.name_en),
  ].filter(Boolean);

  return HOMEPAGE_FEATURED_DOCTOR_NAMES.some((featured) => {
    const target = normalizeDoctorName(featured);
    return names.some(
      (n) => n === target || n.includes(target) || target.includes(n)
    );
  });
}

function featuredDoctorSortIndex(doctor: {
  name?: string | null;
  name_en?: string | null;
}) {
  const names = [
    normalizeDoctorName(doctor.name),
    normalizeDoctorName(doctor.name_en),
  ].filter(Boolean);

  return HOMEPAGE_FEATURED_DOCTOR_NAMES.findIndex((featured) => {
    const target = normalizeDoctorName(featured);
    return names.some(
      (n) => n === target || n.includes(target) || target.includes(n)
    );
  });
}

export async function getExperiencedDoctors(minYears = 4): Promise<Doctor[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  async function selectDoctors(columns: string) {
    return supabase!
      .from("doctors")
      .select(columns)
      .eq("is_active", true)
      .order("experience_years", { ascending: false })
      .order("sort_order", { ascending: true });
  }

  let rows: Doctor[] = [];
  const primary = await selectDoctors(PUBLIC_DOCTOR_COLUMNS_WITH_TIER);

  if (!primary.error) {
    rows = (primary.data as unknown as Doctor[] | null) ?? [];
  } else if (
    primary.error.message?.includes("pricing_tier") ||
    primary.error.message?.includes("morning_days")
  ) {
    const fallback = await selectDoctors(PUBLIC_DOCTOR_COLUMNS_NO_DAYS);
    if (fallback.error) {
      console.error("getExperiencedDoctors:", fallback.error.message);
      return [];
    }
    rows = (fallback.data as unknown as Doctor[] | null) ?? [];
  } else {
    console.error("getExperiencedDoctors:", primary.error.message);
    return [];
  }

  const featured = rows
    .filter((d) =>
      isHomepageFeaturedDoctor({
        name: d.name,
        name_en: d.name_en,
      })
    )
    .sort(
      (a, b) =>
        featuredDoctorSortIndex({
          name: a.name,
          name_en: a.name_en,
        }) -
        featuredDoctorSortIndex({
          name: b.name,
          name_en: b.name_en,
        })
    );

  const featuredIds = new Set(featured.map((d) => d.id));

  const experienced = rows.filter(
    (d) =>
      !featuredIds.has(d.id) && Number(d.experience_years ?? 0) >= minYears
  );

  // Featured trio first (exceptionally), then other experienced doctors.
  return sortDoctorsByTier([...featured, ...experienced].slice(0, 8));
}

export async function getAllDoctorsAdmin() {
  const supabase = await getAuthedClient();

  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

function emptyTimeToNull(t?: string) {
  return t?.trim() || null;
}

export async function saveDoctor(
  form: DoctorFormData,
  id?: string
): Promise<{
  ok: boolean;
  error?: string;
  login_code?: string;
  welcome_email_sent?: boolean;
  welcome_email_error?: string;
}> {
  try {
    const supabase = await getAuthedClient();

    const { data: allDoctors, error: listError } = await supabase
      .from("doctors")
      .select("id, name, name_en, email");

    if (listError) {
      return { ok: false, error: listError.message };
    }

    const duplicate = findDuplicateDoctor(allDoctors ?? [], form, id);
    if (duplicate) {
      return { ok: false, error: duplicateDoctorMessage(duplicate) };
    }

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      name_en: form.name_en?.trim() || null,
      category: form.category.trim() || null,
      specialization: form.specialization.trim(),
      specialization_en: form.specialization_en?.trim() || null,
      bio: form.bio?.trim() || null,
      bio_en: form.bio_en?.trim() || null,
      image_url: form.image_url?.trim() || null,
      experience_years: form.experience_years,
      languages: form.languages,
      is_active: form.is_active,
      sort_order: form.sort_order,
      email: form.email?.trim() || null,
      morning_start: emptyTimeToNull(form.morning_start),
      morning_end: emptyTimeToNull(form.morning_end),
      afternoon_start: emptyTimeToNull(form.afternoon_start),
      afternoon_end: emptyTimeToNull(form.afternoon_end),
      evening_start: emptyTimeToNull(form.evening_start),
      evening_end: emptyTimeToNull(form.evening_end),
      morning_days: form.morning_days?.length ? form.morning_days : null,
      afternoon_days: form.afternoon_days?.length ? form.afternoon_days : null,
      evening_days: form.evening_days?.length ? form.evening_days : null,
      pricing_tier: form.pricing_tier ?? "gp",
    };

    let loginCode: string | undefined;
    let effectiveLoginCode: string | undefined;

    if (id) {
      const { data: existing } = await supabase
        .from("doctors")
        .select("login_code")
        .eq("id", id)
        .maybeSingle();

      effectiveLoginCode = existing?.login_code ?? undefined;

      if (!existing?.login_code) {
        loginCode = generateLoginCode();
        payload.login_code = loginCode;
        effectiveLoginCode = loginCode;
      }

      const { error } = await supabase
        .from("doctors")
        .update(payload)
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
    } else {
      loginCode = generateLoginCode();
      effectiveLoginCode = loginCode;
      const { error } = await supabase
        .from("doctors")
        .insert({ ...payload, login_code: loginCode });
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/book");
    revalidatePath("/admin/doctors");
    if (effectiveLoginCode) {
      revalidatePath(`/doctor/${effectiveLoginCode}/dashboard`);
    }

    let welcome_email_sent: boolean | undefined;
    let welcome_email_error: string | undefined;

    const doctorEmail = form.email?.trim();
    if (loginCode && doctorEmail) {
      const doctorName =
        form.name_en?.trim() || form.name.trim() || "Doctor";
      const specialization =
        form.specialization_en?.trim() || form.specialization.trim();

      try {
        const emailResult = await notifyDoctorWelcome({
          doctor_name: doctorName,
          doctor_email: doctorEmail,
          login_code: loginCode,
          specialization: specialization || undefined,
        });
        welcome_email_sent = emailResult.sent;
        welcome_email_error = emailResult.error;
      } catch (e) {
        console.error("saveDoctor welcome email:", e);
        welcome_email_sent = false;
        welcome_email_error =
          e instanceof Error ? e.message : "Welcome email failed";
      }
    }

    return {
      ok: true,
      login_code: effectiveLoginCode,
      welcome_email_sent,
      welcome_email_error,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/**
 * Doctor updates their own profile on the same `doctors` row the admin manages.
 * Does not allow changing email, login_code, is_active, pricing_tier, or sort_order.
 */
export async function updateDoctorOwnProfile(
  loginCode: string,
  form: DoctorSelfProfileData
): Promise<{ ok: boolean; error?: string }> {
  try {
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

    const code = loginCode.trim().toUpperCase();
    if (!code) {
      return { ok: false, error: "Invalid doctor ID" };
    }

    const name = form.name.trim();
    const specialization = form.specialization.trim();
    if (!name || !specialization) {
      return { ok: false, error: "Name and specialization are required" };
    }

    const { data: existing, error: existingError } = await supabase
      .from("doctors")
      .select("id, auth_user_id, login_code, name, name_en, email")
      .eq("login_code", code)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (!existing) {
      return {
        ok: false,
        error: "Doctor profile not found for this account",
      };
    }

    const listClient = createServiceClient() ?? supabase;
    const { data: peers, error: peersError } = await listClient
      .from("doctors")
      .select("id, name, name_en, email");

    if (peersError) {
      return { ok: false, error: peersError.message };
    }

    const duplicate = findDuplicateDoctor(
      peers ?? [],
      {
        name,
        name_en: form.name_en,
        email: existing.email ?? undefined,
        category: form.category,
        specialization,
        experience_years: form.experience_years,
        languages: form.languages,
        is_active: true,
        sort_order: 0,
      },
      existing.id
    );

    if (duplicate) {
      return { ok: false, error: duplicateDoctorMessage(duplicate) };
    }

    const payload = {
      name,
      name_en: form.name_en?.trim() || null,
      category: form.category.trim() || null,
      specialization,
      specialization_en: form.specialization_en?.trim() || null,
      bio: form.bio?.trim() || null,
      bio_en: form.bio_en?.trim() || null,
      image_url: form.image_url?.trim() || null,
      experience_years: Number.isFinite(form.experience_years)
        ? Math.max(0, Math.floor(form.experience_years))
        : 0,
      languages: form.languages?.length ? form.languages : ["አማርኛ"],
      morning_start: emptyTimeToNull(form.morning_start),
      morning_end: emptyTimeToNull(form.morning_end),
      afternoon_start: emptyTimeToNull(form.afternoon_start),
      afternoon_end: emptyTimeToNull(form.afternoon_end),
      evening_start: emptyTimeToNull(form.evening_start),
      evening_end: emptyTimeToNull(form.evening_end),
      morning_days: form.morning_days?.length ? form.morning_days : null,
      afternoon_days: form.afternoon_days?.length ? form.afternoon_days : null,
      evening_days: form.evening_days?.length ? form.evening_days : null,
    };

    const { error } = await supabase
      .from("doctors")
      .update(payload)
      .eq("id", existing.id)
      .eq("auth_user_id", user.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/book");
    revalidatePath("/doctors");
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctor/${code}/dashboard`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function resendDoctorWelcomeEmail(
  doctorId: string
): Promise<{ ok: boolean; sent?: boolean; error?: string }> {
  try {
    const supabase = await getAuthedClient();

    const { data: doctor, error } = await supabase
      .from("doctors")
      .select(
        "name, name_en, email, login_code, specialization, specialization_en"
      )
      .eq("id", doctorId)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!doctor) return { ok: false, error: "Doctor not found." };

    const email = (doctor.email as string | null)?.trim();
    if (!email) {
      return { ok: false, error: "This doctor has no email on file." };
    }

    const loginCode = (doctor.login_code as string | null)?.trim();
    if (!loginCode) {
      return { ok: false, error: "This doctor has no login ID yet. Save them again first." };
    }

    const doctorName =
      (doctor.name_en as string | null)?.trim() ||
      (doctor.name as string)?.trim() ||
      "Doctor";
    const specialization =
      (doctor.specialization_en as string | null)?.trim() ||
      (doctor.specialization as string | null)?.trim() ||
      undefined;

    const emailResult = await notifyDoctorWelcome({
      doctor_name: doctorName,
      doctor_email: email,
      login_code: loginCode,
      specialization,
    });

    if (!emailResult.sent) {
      return { ok: false, sent: false, error: emailResult.error };
    }

    return { ok: true, sent: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to send welcome email",
    };
  }
}

export async function deleteDoctor(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await getAuthedClient();
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/book");
    revalidatePath("/admin/doctors");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function createAppointment(
  data: AppointmentInsert
): Promise<{ ok: boolean; error?: string; appointmentId?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: true };
  }

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id: data.doctor_id,
      patient_name: data.patient_name,
      phone: data.phone,
      disease: data.disease,
      telegram: data.telegram,
      country: data.country,
      city: data.city,
      consult_type: data.consult_type,
      user_id: data.user_id ?? null,
      availability_period: data.availability_period ?? null,
      availability_time: data.availability_time ?? null,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    console.error("createAppointment:", error.message);
    return { ok: false, error: error.message };
  }

  let doctorName = "Unknown doctor";
  const { data: doctorRow } = await supabase
    .from("doctors")
    .select("name, name_en")
    .eq("id", data.doctor_id)
    .maybeSingle();
  if (doctorRow) {
    doctorName =
      (doctorRow as { name?: string; name_en?: string | null }).name_en?.trim() ||
      (doctorRow as { name?: string }).name ||
      doctorName;
  }

  try {
    await notifyAdminNewAppointment({
      patient_name: data.patient_name,
      phone: data.phone,
      disease: data.disease,
      telegram: data.telegram,
      country: data.country,
      city: data.city,
      consult_type: data.consult_type,
      doctor_name: doctorName,
      availability_time: data.availability_time,
    });
  } catch (e) {
    console.error("createAppointment notify:", e);
  }

  return { ok: true, appointmentId: inserted?.id };
}

export async function signInAdmin(email: string, password: string) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured (missing env vars)" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };

    if (
      data.user &&
      !isAdminRole(data.user.user_metadata as Record<string, unknown>)
    ) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "This account is not an admin. Use patient or doctor login instead.",
      };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to contact Supabase. Check production env vars and network.",
    };
  }
}

export async function signOutAdmin() {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
