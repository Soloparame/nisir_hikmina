export type DoctorCategory = {
  key: string;
  label: string;
  subcategories: string[];
};

/** Top-level categories + subspecialties — stored as-is in Supabase for admin & filtering */
export const DOCTOR_CATEGORIES: DoctorCategory[] = [
  {
    key: "gp_residents",
    label: "General Practitioners & Residents",
    subcategories: [
      "General Practitioner (GP)",
      "Resident Physician",
    ],
  },
  {
    key: "mind_mental_health",
    label: "Mind & Mental Health Care",
    subcategories: [
      "Psychiatrist",
      "Child and Adolescent Psychiatry Subspecialist",
      "Geriatric Psychiatry Subspecialist",
      "Addiction Psychiatry Subspecialist",
      "Forensic Psychiatry Subspecialist",
    ],
  },
  {
    key: "family_medicine",
    label: "Family Medicine (Primary & General Medicine)",
    subcategories: [
      "Family Medicine Specialist",
      "Adolescent Medicine Subspecialist",
      "Geriatric Medicine Subspecialist",
      "Hospice and Palliative Care Medicine Subspecialist",
    ],
  },
  {
    key: "skin_hair",
    label: "Skin & Hair Care",
    subcategories: [
      "General Dermato-Venerology Specialist",
      "Pediatric Dermatology Subspecialist",
      "Cosmetic & Aesthetic Dermatology Subspecialist",
      "Mohs Micrographic Surgery Subspecialist",
      "Dermatopathology Subspecialist",
    ],
  },
  {
    key: "internal_medicine",
    label: "Internal Medicine (Adult Medicine & Chronic Care Management)",
    subcategories: [
      "Internist",
      "Adult Cardiology Subspecialist",
      "Endocrinology Subspecialist",
      "Gastroenterology and Hepatology Subspecialist",
      "Nephrology Subspecialist",
      "Pulmonology and Critical Care Subspecialist",
      "Rheumatology Subspecialist",
      "Infectious Diseases Subspecialist",
      "Allergy & Immunology Subspecialist",
      "Hematology Oncology Subspecialist",
    ],
  },
  {
    key: "womens_pregnancy",
    label: "Women's & Pregnancy Health",
    subcategories: [
      "Obstetrics and Gynecologist Specialist (OB/GYN)",
      "Maternal-Fetal Medicine Subspecialist",
      "Reproductive Endocrinology and Infertility Subspecialist",
      "Gynecologic Oncology Subspecialist",
      "Female Pelvic Medicine and Reconstructive Surgery Subspecialist",
    ],
  },
  {
    key: "pediatrics",
    label: "Pediatrics (Children's Health)",
    subcategories: [
      "Pediatrician",
      "Neonatology Subspecialist",
      "Pediatric Cardiology Subspecialist",
      "Pediatric Endocrinology Subspecialist",
      "Pediatric Gastroenterology Subspecialist",
      "Pediatric Pulmonology Subspecialist",
      "Pediatric Nephrology Subspecialist",
      "Pediatric Rheumatology Subspecialist",
      "Pediatric Infectious Diseases Subspecialist",
      "Pediatric Allergy and Immunology Subspecialist",
      "Pediatric Hematology-Oncology Subspecialist",
    ],
  },
  {
    key: "neurology",
    label: "Neurology",
    subcategories: [
      "Clinical Neurologist",
      "Stroke and Neurovascular Neurology Subspecialist",
      "Epilepsy and Clinical Neurophysiology Subspecialist",
      "Neuromuscular Medicine Subspecialist",
      "Movement Disorders Subspecialist",
      "Neuro-Oncology Subspecialist",
      "Behavioral Neurology & Dementia Subspecialist",
      "Headache Medicine Subspecialist",
    ],
  },
  {
    key: "emergency_urgent",
    label: "Emergency & Urgent Care (Immediate Digital Triage)",
    subcategories: [
      "Emergency Medicine and Critical Care Specialist",
      "Medical Toxicology Subspecialist",
      "Pediatric Emergency Medicine Subspecialist",
      "Critical and Intensive Care Subspecialist",
    ],
  },
  {
    key: "aesthetic_sexual_health",
    label: "Aesthetic & Sexual Health",
    subcategories: [
      "Certified Cosmetic Medicine Consultant",
      "Sexual Medicine Consultant",
    ],
  },
  {
    key: "pain_anesthesia",
    label: "Pain Management & Anesthesia (Chronic Pain Tracking)",
    subcategories: [
      "Pain Medicine Subspecialist",
      "Interventional Pain Management Subspecialist",
      "Anesthesiology and Critical Care Pain Medicine Specialist",
    ],
  },
  {
    key: "ent",
    label: "Otolaryngology & Head and Neck Surgery (ENT Consultations)",
    subcategories: [
      "Otolaryngology and HNS Specialist",
      "Otology and Neurotology Subspecialist",
      "Rhinology and Sinus Surgery Subspecialist",
      "Laryngology Subspecialist",
      "Pediatric Otolaryngology Subspecialist",
      "Advanced Head and Neck Oncologic Surgery Subspecialist",
    ],
  },
  {
    key: "ophthalmology",
    label: "Ophthalmology (Eye Care Consultations)",
    subcategories: [
      "General Ophthalmology Specialist",
      "Retina and Vitreous Diseases Subspecialist",
      "Cornea and External Disease Subspecialist",
      "Glaucoma Subspecialist",
      "Oculoplastic and Orbital Surgery Subspecialist",
      "Pediatric Ophthalmology and Strabismus Subspecialist",
      "Neuro-Ophthalmology Subspecialist",
    ],
  },
  {
    key: "orthopedics",
    label: "Orthopedics & Musculoskeletal Care",
    subcategories: [
      "General Orthopedics and Traumatology Specialist",
      "Joint Reconstruction & Replacement Specialist",
      "Sports Medicine Subspecialist",
      "Pediatric Orthopedic Surgery Subspecialist",
      "Spine Surgery Subspecialist",
      "Orthopedic Trauma Surgery Subspecialist",
      "Hand, Wrist & Upper Extremity Surgery Subspecialist",
      "Foot & Ankle Surgery Subspecialist",
      "Orthopedic Oncology Subspecialist",
    ],
  },
  {
    key: "dental",
    label: "Dental & Oral Health Consultation",
    subcategories: [
      "General Dentistry",
      "Orthodontics & Dentofacial Orthopedics Specialist",
      "Pediatric Dentistry Specialist",
      "Endodontics Specialist",
      "Periodontics Specialist",
      "Prosthodontics Specialist",
      "Oral and Maxillofacial Surgery Specialist",
    ],
  },
  {
    key: "surgery",
    label: "General & Specialized Surgery Consultations (Second Opinions Pre & Post-Op)",
    subcategories: [
      "General Surgeon",
      "Colorectal Surgery Subspecialist",
      "Surgical Oncology Subspecialist",
      "Vascular and Endovascular Surgery Subspecialist",
      "Breast and Endocrine Surgery Subspecialist",
      "Pediatric Surgery Subspecialist",
      "Thoracic Surgery Subspecialist",
      "Cardiac Surgery Subspecialist",
      "Neurosurgery Subspecialist",
      "Hepato-Pancreatico-Biliary Surgery Subspecialist",
      "Plastic & Reconstructive Surgery Subspecialist",
      "Urological Surgery Subspecialist",
      "Bariatric Surgery Subspecialist",
      "Trauma & Surgical Critical Care Subspecialist",
    ],
  },
  {
    key: "radiology",
    label: "Radiology & Imaging (Expert Second Opinions)",
    subcategories: [
      "General Clinical Radiologist",
      "Diagnostic and Body Imaging Radiology Subspecialist",
      "Interventional Radiology Subspecialist",
      "Neuroradiology Subspecialist",
      "Pediatric Radiology Subspecialist",
      "Female & Breast Imaging Subspecialist",
      "Nuclear Medicine Specialist",
    ],
  },
  {
    key: "pathology",
    label: "Pathology & Advanced Laboratory Consultations (Diagnostic Verification)",
    subcategories: [
      "General Anatomical Pathology Specialist",
      "Chemical Pathology Subspecialist",
      "Cytopathology Subspecialist",
      "Systematic Pathology Subspecialist",
      "Forensic Pathology Subspecialist",
      "Pediatric & Perinatal Pathology Subspecialist",
      "Medical Microbiology Subspecialist",
      "Molecular Genetic Pathology Subspecialist",
    ],
  },
  {
    key: "physiotherapy",
    label: "Physical Medicine & Rehabilitation (Physiotherapy)",
    subcategories: [
      "Physiotherapist",
      "Stroke Rehabilitation Specialist",
      "Amputee & Prosthetics Specialist",
      "Orthopedic Physical Therapy Specialist",
      "Neurological Physical Therapy Specialist",
      "Pediatric Physical Therapy Specialist",
      "Geriatric Physical Therapy Specialist",
    ],
  },
  {
    key: "nutrition",
    label: "Nutrition & Dietetics",
    subcategories: [
      "Clinical Nutritionist",
      "Pediatric Nutritionist",
      "Sports Nutrition & Weight Management Specialist",
      "Eating Disorder Nutritional Therapist",
    ],
  },
  {
    key: "speech_therapy",
    label: "Speech-Language Therapy",
    subcategories: [
      "Pediatric Speech and Language Disorders Specialist",
      "Adult Neurogenic Communication Disorders Specialist",
      "Swallowing Disorders Specialist",
    ],
  },
  {
    key: "oncology",
    label: "Oncology",
    subcategories: ["Clinical Oncologist"],
  },
];

export function getCategoryByKey(key: string) {
  return DOCTOR_CATEGORIES.find((c) => c.key === key);
}

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
