export type DoctorCategory = {
  key: string;
  label: string;
  subcategories: string[];
};

// Top-level categories + their sub-specialties.
// Values are meant to be stored as-is in Supabase so filtering matches reliably.
export const DOCTOR_CATEGORIES: DoctorCategory[] = [
  {
    key: "primary_care_general_medicine",
    label: "Primary Care & General Medicine",
    subcategories: [
      "General Medicine / Family Medicine",
      "Internal Medicine (Adult Care)",
      "Geriatric Medicine (Elderly Care)",
      "Preventative Health & Wellness",
    ],
  },
  {
    key: "womens_mens_health",
    label: "Women’s & Men’s Health",
    subcategories: [
      "Gynecology & Obstetrics",
      "Sexual & Reproductive Health",
      "Urology (Urinary & Men's Health)",
    ],
  },
  {
    key: "pediatrics",
    label: "Pediatrics (Children’s Health)",
    subcategories: [
      "General Pediatrics",
      "Pediatric Development & Behavioral Health",
      "Pediatric Sub-specialties (Cardiology, Endocrinology, Neurology)",
    ],
  },
  {
    key: "brain_mind_nerve",
    label: "Brain, Mind & Nerve Care",
    subcategories: [
      "Psychiatry & Behavioral Health",
      "Neurology (Brain & Nerve Care)",
      "Addiction Medicine & Counseling",
    ],
  },
  {
    key: "heart_blood_lung",
    label: "Heart, Blood & Lung Care",
    subcategories: [
      "Cardiology (Heart Care)",
      "Pulmonology (Lung & Respiratory Care)",
      "Hematology (Blood Disorders)",
    ],
  },
  {
    key: "digestion_metabolic",
    label: "Digestion & Metabolic Health",
    subcategories: [
      "Gastroenterology & Hepatology (Digestive & Liver Care)",
      "Nephrology (Kidney Care)",
      "Endocrinology (Diabetes & Hormones)",
      "Nutrition & Dietetics",
    ],
  },
  {
    key: "immune_joint_cancer",
    label: "Immune, Joint & Cancer Care",
    subcategories: [
      "Infectious Disease",
      "Rheumatology (Joint & Autoimmune)",
      "Oncology (Cancer Care)",
      "Allergy & Immunology",
    ],
  },
  {
    key: "head_face_vision",
    label: "Head, Face & Vision Specialties",
    subcategories: [
      "Ophthalmology (Eye Care)",
      "ENT (Ear, Nose & Throat)",
      "Dentistry & Oral Health",
      "Dermatology (Skin, Hair & Nails)",
    ],
  },
  {
    key: "surgery_advanced",
    label: "Surgery & Advanced Consultations",
    subcategories: [
      "General Surgery Consultations",
      "Surgical Sub-specialties (Orthopedics, Neurosurgery, Plastics, Vascular)",
      "Anesthetics & Chronic Pain Management",
    ],
  },
  {
    key: "diagnostics_therapy_support",
    label: "Diagnostics, Therapy & Support",
    subcategories: [
      "Radiology (Imaging Review & Second Opinions)",
      "Physical Medicine & Rehabilitation (Physiotherapy)",
      "Palliative Care & Symptom Management",
      "Medical Genetics & Counseling",
    ],
  },
];

export function getCategoryByLabel(label: string) {
  return DOCTOR_CATEGORIES.find((c) => c.label === label);
}

export function getSubcategoriesForCategoryLabel(categoryLabel: string) {
  return getCategoryByLabel(categoryLabel)?.subcategories ?? [];
}

export function findCategoryLabelBySubcategory(subcategory: string) {
  const match = DOCTOR_CATEGORIES.find((c) =>
    c.subcategories.includes(subcategory)
  );
  return match?.label ?? "";
}

