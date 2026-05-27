export type Doctor = {
  id: string;
  name: string;
  name_en: string | null;
  // Top-level category selected by admin.
  // Example: "Primary Care & General Medicine"
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
};

export type DoctorFormData = {
  name: string;
  name_en?: string;
  // Top-level category selected by admin.
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
};
