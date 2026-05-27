import type { Doctor } from "./types/doctor";
import type { Locale } from "./i18n/translations";

export function getDoctorName(doctor: Doctor, locale: Locale) {
  if (locale === "en" && doctor.name_en) return doctor.name_en;
  return doctor.name;
}

export function getDoctorCategory(doctor: Doctor, locale: Locale) {
  // Categories are stored in English in this app version.
  // If in the future you store `category_en`, we can extend this.
  return doctor.category ?? "";
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
