"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import type { AppointmentInsert, DoctorFormData } from "../types/doctor";

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

  return supabase;
}

export async function getActiveDoctors() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveDoctors:", error.message);
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

export async function saveDoctor(
  form: DoctorFormData,
  id?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await getAuthedClient();

    const payload = {
      name: form.name.trim(),
      name_en: form.name_en?.trim() || null,
      specialization: form.specialization.trim(),
      specialization_en: form.specialization_en?.trim() || null,
      bio: form.bio?.trim() || null,
      bio_en: form.bio_en?.trim() || null,
      image_url: form.image_url?.trim() || null,
      experience_years: form.experience_years,
      languages: form.languages,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    const { error } = id
      ? await supabase.from("doctors").update(payload).eq("id", id)
      : await supabase.from("doctors").insert(payload);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/book");
    revalidatePath("/admin/doctors");
    return { ok: true };
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
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: true };
  }

  const { error } = await supabase.from("appointments").insert({
    doctor_id: data.doctor_id,
    patient_name: data.patient_name,
    phone: data.phone,
    disease: data.disease,
    telegram: data.telegram,
    country: data.country,
    city: data.city,
    consult_type: data.consult_type,
  });

  if (error) {
    console.error("createAppointment:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function signInAdmin(email: string, password: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAdmin() {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
