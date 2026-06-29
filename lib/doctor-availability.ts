import {
  formatWeekdayList,
  getPeriodDays,
  getWeekdayKeyFromDate,
  isPeriodAvailableOnDate,
  type WeekdayKey,
} from "./availability-days";
import type { Doctor, DoctorAvailabilityPeriod } from "./types/doctor";

export type AvailabilitySlot = {
  period: DoctorAvailabilityPeriod;
  labelKey: "morning" | "afternoon" | "evening";
  start: string;
  end: string;
};

export type WeeklyScheduleEntry = {
  period: DoctorAvailabilityPeriod;
  labelKey: "morning" | "afternoon" | "evening";
  days: WeekdayKey[];
  timeRange: string;
};

function formatTime(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const min = m?.slice(0, 2) ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${min} ${ampm}`;
}

export function getDoctorAvailabilitySlots(
  doctor: Doctor,
  date?: string
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const weekday = date ? getWeekdayKeyFromDate(date) : null;

  if (doctor.morning_start && doctor.morning_end) {
    if (!weekday || isPeriodAvailableOnDate(doctor, "morning", date!)) {
      slots.push({
        period: "morning",
        labelKey: "morning",
        start: doctor.morning_start,
        end: doctor.morning_end,
      });
    }
  }
  if (doctor.afternoon_start && doctor.afternoon_end) {
    if (!weekday || isPeriodAvailableOnDate(doctor, "afternoon", date!)) {
      slots.push({
        period: "afternoon",
        labelKey: "afternoon",
        start: doctor.afternoon_start,
        end: doctor.afternoon_end,
      });
    }
  }
  if (doctor.evening_start && doctor.evening_end) {
    if (!weekday || isPeriodAvailableOnDate(doctor, "evening", date!)) {
      slots.push({
        period: "evening",
        labelKey: "evening",
        start: doctor.evening_start,
        end: doctor.evening_end,
      });
    }
  }

  return slots;
}

export function formatAvailabilitySlot(slot: AvailabilitySlot): string {
  const start = formatTime(slot.start);
  const end = formatTime(slot.end);
  if (!start || !end) return "";
  return `${start} – ${end}`;
}

export function getDoctorWeeklySchedule(doctor: Doctor): WeeklyScheduleEntry[] {
  const entries: WeeklyScheduleEntry[] = [];

  if (doctor.morning_start && doctor.morning_end) {
    entries.push({
      period: "morning",
      labelKey: "morning",
      days: getPeriodDays(doctor, "morning"),
      timeRange: formatAvailabilitySlot({
        period: "morning",
        labelKey: "morning",
        start: doctor.morning_start,
        end: doctor.morning_end,
      }),
    });
  }
  if (doctor.afternoon_start && doctor.afternoon_end) {
    entries.push({
      period: "afternoon",
      labelKey: "afternoon",
      days: getPeriodDays(doctor, "afternoon"),
      timeRange: formatAvailabilitySlot({
        period: "afternoon",
        labelKey: "afternoon",
        start: doctor.afternoon_start,
        end: doctor.afternoon_end,
      }),
    });
  }
  if (doctor.evening_start && doctor.evening_end) {
    entries.push({
      period: "evening",
      labelKey: "evening",
      days: getPeriodDays(doctor, "evening"),
      timeRange: formatAvailabilitySlot({
        period: "evening",
        labelKey: "evening",
        start: doctor.evening_start,
        end: doctor.evening_end,
      }),
    });
  }

  return entries;
}

function addDaysToIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getUpcomingBookableDates(
  doctor: Doctor,
  fromDate: string,
  limit = 14,
  scanDays = 60
): string[] {
  const dates: string[] = [];
  for (let i = 0; i < scanDays && dates.length < limit; i++) {
    const iso = addDaysToIsoDate(fromDate, i);
    if (getDoctorAvailabilitySlots(doctor, iso).length > 0) {
      dates.push(iso);
    }
  }
  return dates;
}

export function formatBookableDateChip(
  date: string,
  locale: "en" | "am" = "en"
): string {
  const d = new Date(`${date}T12:00:00`);
  const weekday = d.toLocaleDateString(locale === "am" ? "am-ET" : "en-US", {
    weekday: "short",
  });
  const dayMonth = d.toLocaleDateString(locale === "am" ? "am-ET" : "en-US", {
    month: "short",
    day: "numeric",
  });
  return `${weekday}, ${dayMonth}`;
}

export function generateLoginCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
