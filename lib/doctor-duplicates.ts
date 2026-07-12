import type { DoctorFormData } from "./types/doctor";

export function normalizeDoctorField(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

type DoctorRow = {
  id: string;
  name: string;
  name_en?: string | null;
  email?: string | null;
};

export function findDuplicateDoctor(
  doctors: DoctorRow[],
  form: DoctorFormData,
  excludeId?: string
): { field: "email" | "name" | "name_en"; existing: DoctorRow } | null {
  const emailNorm = normalizeDoctorField(form.email);
  const nameNorm = normalizeDoctorField(form.name);
  const nameEnNorm = normalizeDoctorField(form.name_en);

  for (const existing of doctors) {
    if (excludeId && existing.id === excludeId) continue;

    if (emailNorm && normalizeDoctorField(existing.email) === emailNorm) {
      return { field: "email", existing };
    }

    if (nameNorm && normalizeDoctorField(existing.name) === nameNorm) {
      return { field: "name", existing };
    }

    if (nameEnNorm && normalizeDoctorField(existing.name_en) === nameEnNorm) {
      return { field: "name_en", existing };
    }
  }

  return null;
}

export function duplicateDoctorMessage(
  match: NonNullable<ReturnType<typeof findDuplicateDoctor>>
) {
  const label =
    match.existing.name_en?.trim() ||
    match.existing.name?.trim() ||
    "Existing doctor";

  if (match.field === "email") {
    return `This doctor already exists — the email "${match.existing.email}" is already registered for ${label}. Edit that profile instead of adding a duplicate.`;
  }

  if (match.field === "name_en") {
    return `This doctor already exists — the English name "${match.existing.name_en}" is already registered. Edit that profile instead of adding a duplicate.`;
  }

  return `This doctor already exists — the name "${match.existing.name}" is already registered. Edit that profile instead of adding a duplicate.`;
}
