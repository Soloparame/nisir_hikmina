import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Activity,
  Apple,
  Baby,
  Bone,
  Brain,
  BrainCircuit,
  Ear,
  Eye,
  Heart,
  HeartPlus,
  HeartPulse,
  House,
  Leaf,
  MessagesSquare,
  Microscope,
  Scan,
  Scissors,
  Siren,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export type ServiceCategoryIconConfig = {
  Icon: LucideIcon;
  alt: string;
  bg: string;
  color: string;
};

/** Local Lucide icons — no external CDN (works offline / all networks). */
export const SERVICE_CATEGORY_ICONS: Record<string, ServiceCategoryIconConfig> =
  {
    gp_residents: {
      Icon: Stethoscope,
      alt: "Stethoscope icon",
      bg: "#dbeafe",
      color: "#004d4d",
    },
    mind_mental_health: {
      Icon: Brain,
      alt: "Brain icon",
      bg: "#ede9fe",
      color: "#7c3aed",
    },
    family_medicine: {
      Icon: House,
      alt: "Home icon",
      bg: "#dcfce7",
      color: "#008966",
    },
    skin_hair: {
      Icon: Sparkles,
      alt: "Skin care icon",
      bg: "#ffedd5",
      color: "#ea580c",
    },
    internal_medicine: {
      Icon: HeartPulse,
      alt: "Heart pulse icon",
      bg: "#dbeafe",
      color: "#dc2626",
    },
    womens_pregnancy: {
      Icon: Heart,
      alt: "Women's health icon",
      bg: "#fce7f3",
      color: "#db2777",
    },
    pediatrics: {
      Icon: Baby,
      alt: "Pediatrics icon",
      bg: "#fef3c7",
      color: "#a16207",
    },
    neurology: {
      Icon: BrainCircuit,
      alt: "Neurology icon",
      bg: "#ede9fe",
      color: "#6b21a8",
    },
    emergency_urgent: {
      Icon: Siren,
      alt: "Emergency icon",
      bg: "#fee2e2",
      color: "#dc2626",
    },
    aesthetic_sexual_health: {
      Icon: Leaf,
      alt: "Aesthetic health icon",
      bg: "#dcfce7",
      color: "#089981",
    },
    pain_anesthesia: {
      Icon: Activity,
      alt: "Pain management icon",
      bg: "#dbeafe",
      color: "#02569b",
    },
    ent: {
      Icon: Ear,
      alt: "ENT icon",
      bg: "#cffafe",
      color: "#b45309",
    },
    ophthalmology: {
      Icon: Eye,
      alt: "Eye icon",
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    orthopedics: {
      Icon: Bone,
      alt: "Orthopedics icon",
      bg: "#dcfce7",
      color: "#0f766e",
    },
    dental: {
      Icon: HeartPlus,
      alt: "Dental care icon",
      bg: "#cffafe",
      color: "#0ea5e9",
    },
    surgery: {
      Icon: Scissors,
      alt: "Surgery icon",
      bg: "#dbeafe",
      color: "#02569b",
    },
    radiology: {
      Icon: Scan,
      alt: "Radiology icon",
      bg: "#ede9fe",
      color: "#7c3aed",
    },
    pathology: {
      Icon: Microscope,
      alt: "Microscope icon",
      bg: "#dcfce7",
      color: "#089981",
    },
    physiotherapy: {
      Icon: Accessibility,
      alt: "Rehabilitation icon",
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    nutrition: {
      Icon: Apple,
      alt: "Nutrition icon",
      bg: "#fef3c7",
      color: "#16a34a",
    },
    speech_therapy: {
      Icon: MessagesSquare,
      alt: "Speech therapy icon",
      bg: "#e9d5ff",
      color: "#3b82f6",
    },
  };
