import type { Doctor } from "./types/doctor";
import type { Locale } from "./i18n/translations";

export function getDoctorName(doctor: Doctor, locale: Locale) {
  if (locale === "en" && doctor.name_en) return doctor.name_en;
  return doctor.name;
}

export function getDoctorSpecialization(doctor: Doctor, locale: Locale) {
  if (locale === "en" && doctor.specialization_en) {
    return doctor.specialization_en;
  }
  return doctor.specialization;
}

export function getDoctorBio(doctor: Doctor, locale: Locale) {
  if (locale === "en" && doctor.bio_en) return doctor.bio_en;
  return doctor.bio ?? "";
}
