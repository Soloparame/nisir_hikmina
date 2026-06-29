import type { Doctor, DoctorAvailabilityPeriod } from "./types/doctor";

export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const WEEKDAY_OPTIONS: { key: WeekdayKey; label: string }[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

export const DEFAULT_WEEKDAYS: WeekdayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const WEEKDAY_KEYS: WeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getWeekdayKeyFromDate(date: string): WeekdayKey {
  const day = new Date(`${date}T12:00:00`).getDay();
  return WEEKDAY_KEYS[day] ?? "monday";
}

export function getPeriodDays(
  doctor: Doctor,
  period: DoctorAvailabilityPeriod
): WeekdayKey[] {
  const days =
    period === "morning"
      ? doctor.morning_days
      : period === "afternoon"
        ? doctor.afternoon_days
        : doctor.evening_days;

  if (days && days.length > 0) {
    return days.filter((d): d is WeekdayKey =>
      WEEKDAY_KEYS.includes(d as WeekdayKey)
    );
  }
  return DEFAULT_WEEKDAYS;
}

export function formatWeekdayList(
  days: WeekdayKey[],
  locale: "en" | "am" = "en"
): string {
  const order: WeekdayKey[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const sorted = [...days].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  if (sorted.length === 7) {
    return locale === "am" ? "ሁሉም ቀናት" : "Every day";
  }

  const labels: Record<WeekdayKey, { en: string; am: string }> = {
    monday: { en: "Mon", am: "ሰኞ" },
    tuesday: { en: "Tue", am: "ማክሰ" },
    wednesday: { en: "Wed", am: "ረቡዕ" },
    thursday: { en: "Thu", am: "ሐሙስ" },
    friday: { en: "Fri", am: "ዓርብ" },
    saturday: { en: "Sat", am: "ቅዳሜ" },
    sunday: { en: "Sun", am: "እሁድ" },
  };

  return sorted.map((d) => labels[d][locale]).join(", ");
}

export function formatWeekdayName(
  date: string,
  locale: "en" | "am" = "en"
): string {
  const key = getWeekdayKeyFromDate(date);
  const labels: Record<WeekdayKey, { en: string; am: string }> = {
    monday: { en: "Monday", am: "ሰኞ" },
    tuesday: { en: "Tuesday", am: "ማክሰኞ" },
    wednesday: { en: "Wednesday", am: "ረቡዕ" },
    thursday: { en: "Thursday", am: "ሐሙስ" },
    friday: { en: "Friday", am: "ዓርብ" },
    saturday: { en: "Saturday", am: "ቅዳሜ" },
    sunday: { en: "Sunday", am: "እሁድ" },
  };
  return labels[key][locale];
}

export function isPeriodAvailableOnDate(
  doctor: Doctor,
  period: DoctorAvailabilityPeriod,
  date: string
): boolean {
  const weekday = getWeekdayKeyFromDate(date);
  return getPeriodDays(doctor, period).includes(weekday);
}
