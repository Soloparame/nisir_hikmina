"use server";

import { revalidatePath } from "next/cache";
import { isAdminRole } from "../auth-roles";
import { generateLoginCode } from "../doctor-availability";
import { notifyAdminNewAppointment } from "../notify-admin-appointment";
import { createClient } from "../supabase/server";
import type { AppointmentInsert, DoctorFormData } from "../types/doctor";
import { PUBLIC_DOCTOR_COLUMNS } from "../types/doctor";
import { getOrCreateConversation } from "./chat";

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

  const { data, error } = await supabase
    .from("doctors")
    .select(PUBLIC_DOCTOR_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveDoctors:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getExperiencedDoctors(minYears = 4) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("doctors")
    .select(PUBLIC_DOCTOR_COLUMNS)
    .eq("is_active", true)
    .gte("experience_years", minYears)
    .order("experience_years", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(8);

  if (error) {
    console.error("getExperiencedDoctors:", error.message);
    return [];
  }

  return data ?? [];
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
): Promise<{ ok: boolean; error?: string; login_code?: string }> {
  try {
    const supabase = await getAuthedClient();

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
    };

    let loginCode: string | undefined;

    if (id) {
      const { data: existing } = await supabase
        .from("doctors")
        .select("login_code")
        .eq("id", id)
        .maybeSingle();

      if (!existing?.login_code) {
        loginCode = generateLoginCode();
        payload.login_code = loginCode;
      }

      const { error } = await supabase
        .from("doctors")
        .update(payload)
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
    } else {
      loginCode = generateLoginCode();
      const { error } = await supabase
        .from("doctors")
        .insert({ ...payload, login_code: loginCode });
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/book");
    revalidatePath("/admin/doctors");
    return { ok: true, login_code: loginCode };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
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
      status: "confirmed",
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

  if (data.user_id && inserted?.id) {
    try {
      await getOrCreateConversation(data.doctor_id, inserted.id);
    } catch (e) {
      console.error("createAppointment conversation:", e);
    }
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
