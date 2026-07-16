export type DoctorAvailabilityPeriod = "morning" | "afternoon" | "evening";

export type DoctorPricingTier = "gp" | "resident" | "specialist" | "senior";

export type Doctor = {
  id: string;
  name: string;
  name_en: string | null;
  category: string | null;
  specialization: string;
  specialization_en: string | null;
  bio: string | null;
  bio_en: string | null;
  image_url: string | null;
  experience_years: number;
  languages: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  email?: string | null;
  login_code?: string | null;
  auth_user_id?: string | null;
  pricing_tier?: DoctorPricingTier | null;
  morning_start?: string | null;
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  evening_start?: string | null;
  evening_end?: string | null;
  morning_days?: string[] | null;
  afternoon_days?: string[] | null;
  evening_days?: string[] | null;
};

export type DoctorPublic = Omit<Doctor, "email" | "auth_user_id">;

export const PUBLIC_DOCTOR_COLUMNS =
  "id,name,name_en,category,specialization,specialization_en,bio,bio_en,image_url,experience_years,languages,is_active,sort_order,created_at,morning_start,morning_end,afternoon_start,afternoon_end,evening_start,evening_end,morning_days,afternoon_days,evening_days";

export const PUBLIC_DOCTOR_COLUMNS_WITH_TIER = `${PUBLIC_DOCTOR_COLUMNS},pricing_tier`;

/** Before migration-v17 (no weekday columns) */
export const PUBLIC_DOCTOR_COLUMNS_NO_DAYS =
  "id,name,name_en,category,specialization,specialization_en,bio,bio_en,image_url,experience_years,languages,is_active,sort_order,created_at,morning_start,morning_end,afternoon_start,afternoon_end,evening_start,evening_end,pricing_tier";

export type DoctorFormData = {
  name: string;
  name_en?: string;
  category: string;
  specialization: string;
  specialization_en?: string;
  bio?: string;
  bio_en?: string;
  image_url?: string;
  experience_years: number;
  languages: string[];
  is_active: boolean;
  sort_order: number;
  email?: string;
  pricing_tier?: DoctorPricingTier;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  evening_start?: string;
  evening_end?: string;
  morning_days?: string[];
  afternoon_days?: string[];
  evening_days?: string[];
};

/** Fields a doctor may edit on their own profile (same DB row as admin). */
export type DoctorSelfProfileData = {
  name: string;
  name_en?: string;
  category: string;
  specialization: string;
  specialization_en?: string;
  bio?: string;
  bio_en?: string;
  image_url?: string;
  experience_years: number;
  languages: string[];
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  evening_start?: string;
  evening_end?: string;
  morning_days?: string[];
  afternoon_days?: string[];
  evening_days?: string[];
};

export type AppointmentInsert = {
  doctor_id: string;
  patient_name: string;
  phone: string;
  disease: string;
  telegram: string;
  country: string;
  city: string;
  consult_type: string;
  user_id?: string;
  availability_period?: string;
  availability_time?: string;
};

export type Appointment = {
  id: string;
  doctor_id: string | null;
  patient_name: string;
  phone: string;
  disease: string;
  telegram: string;
  country: string | null;
  city: string | null;
  consult_type: string;
  status: string;
  created_at: string;
  user_id?: string | null;
  availability_period?: string | null;
  availability_time?: string | null;
  consult_type_key?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  amount_etb?: number | null;
  payment_screenshot_url?: string | null;
  payment_method?: string | null;
};
