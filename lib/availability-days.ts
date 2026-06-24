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

export function isPeriodAvailableOnDate(
  doctor: Doctor,
  period: DoctorAvailabilityPeriod,
  date: string
): boolean {
  const weekday = getWeekdayKeyFromDate(date);
  return getPeriodDays(doctor, period).includes(weekday);
}
