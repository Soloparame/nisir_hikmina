export type DoctorAvailabilityPeriod = "morning" | "afternoon" | "evening";

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
  morning_start?: string | null;
  morning_end?: string | null;
  afternoon_start?: string | null;
  afternoon_end?: string | null;
  evening_start?: string | null;
  evening_end?: string | null;
};

export type DoctorPublic = Omit<Doctor, "email" | "auth_user_id">;

export const PUBLIC_DOCTOR_COLUMNS =
  "id,name,name_en,category,specialization,specialization_en,bio,bio_en,image_url,experience_years,languages,is_active,sort_order,created_at,morning_start,morning_end,afternoon_start,afternoon_end,evening_start,evening_end";

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
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  evening_start?: string;
  evening_end?: string;
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
};
