import type { Doctor } from "./types/doctor";

export type PricingTier = "gp" | "resident" | "specialist" | "senior";
export type ConsultTypeKey = "text" | "audio" | "video";

export const CONSULT_DURATIONS: Record<ConsultTypeKey, number> = {
  text: 15,
  audio: 20,
  video: 20,
};

const BASE_PRICES: Record<PricingTier, Record<ConsultTypeKey, number>> = {
  gp: { text: 300, audio: 600, video: 800 },
  resident: { text: 400, audio: 700, video: 900 },
  specialist: { text: 500, audio: 1000, video: 1500 },
  senior: { text: 800, audio: 1500, video: 2500 },
};

export const ADDITIONAL_MINUTE_RATES: Record<ConsultTypeKey, number> = {
  text: 25,
  audio: 50,
  video: 75,
};

export const PRESCRIPTION_SERVICES = {
  digitalPrescription: 300,
  specialistReferralLetter: 500,
} as const;

export function getDoctorPricingTier(doctor: Doctor): PricingTier {
  const tier = doctor.pricing_tier;
  if (
    tier === "resident" ||
    tier === "specialist" ||
    tier === "senior"
  ) {
    return tier;
  }
  return "gp";
}

export function getConsultationPrice(
  tier: PricingTier,
  type: ConsultTypeKey
): number {
  return BASE_PRICES[tier][type];
}

export function formatEtb(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

export function getTierPricingList(tier: PricingTier) {
  return (["text", "audio", "video"] as ConsultTypeKey[]).map((type) => ({
    type,
    duration: CONSULT_DURATIONS[type],
    price: BASE_PRICES[tier][type],
    extraPerMin: ADDITIONAL_MINUTE_RATES[type],
  }));
}

export function consultTypeLabel(
  type: ConsultTypeKey,
  locale: "en" | "am"
): string {
  const labels: Record<ConsultTypeKey, { en: string; am: string }> = {
    text: { en: "Text Consultation", am: "የጽሑፍ ምክክር" },
    audio: { en: "Voice Consultation", am: "የድምጽ ምክክር" },
    video: { en: "Video Consultation", am: "የቪዲዮ ምክክር" },
  };
  return labels[type][locale];
}

export function getTierLabel(tier: PricingTier, locale: "en" | "am"): string {
  const labels: Record<PricingTier, { en: string; am: string }> = {
    gp: {
      en: "General Practitioner (GP)",
      am: "ጠቅላላ ሐኪም (GP)",
    },
    resident: {
      en: "Resident Physician",
      am: "ሪዚደንት ሐኪም",
    },
    specialist: {
      en: "Specialist Doctor",
      am: "ስፔሻሊስት ዶክተር",
    },
    senior: {
      en: "Subspecialist / Consultant",
      am: "ንዑስ ስፔሻሊስት / ኮንሰልታንት",
    },
  };
  return labels[tier][locale];
}

export const ALL_PRICING_TIERS: PricingTier[] = [
  "gp",
  "resident",
  "specialist",
  "senior",
];

/** Display order: Subspecialists → Specialists → Residents → GPs */
const TIER_DISPLAY_RANK: Record<PricingTier, number> = {
  senior: 0,
  specialist: 1,
  resident: 2,
  gp: 3,
};

export function sortDoctorsByTier<T extends Doctor>(doctors: T[]): T[] {
  return [...doctors].sort((a, b) => {
    const tierDiff =
      TIER_DISPLAY_RANK[getDoctorPricingTier(a)] -
      TIER_DISPLAY_RANK[getDoctorPricingTier(b)];
    if (tierDiff !== 0) return tierDiff;

    const sortDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (sortDiff !== 0) return sortDiff;

    const expDiff = (b.experience_years ?? 0) - (a.experience_years ?? 0);
    if (expDiff !== 0) return expDiff;

    const nameA = (a.name_en || a.name || "").toLowerCase();
    const nameB = (b.name_en || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}
