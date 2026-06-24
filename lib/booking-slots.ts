import type { AvailabilitySlot } from "./doctor-availability";

export type TimeSlotOption = {
  time: string;
  label: string;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":");
  return parseInt(h, 10) * 60 + parseInt(m?.slice(0, 2) ?? "0", 10);
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDisplayTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const min = m?.slice(0, 2) ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${min} ${ampm}`;
}

/** Generate bookable times within a doctor availability period. */
export function generateTimeSlotsForPeriod(
  period: AvailabilitySlot,
  slotMinutes = 20
): TimeSlotOption[] {
  const start = parseTimeToMinutes(period.start);
  const end = parseTimeToMinutes(period.end);
  const slots: TimeSlotOption[] = [];

  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    const time = minutesToTime(t);
    slots.push({ time, label: formatDisplayTime(time) });
  }

  return slots;
}

export function formatScheduledDateTime(
  date: string,
  time: string,
  periodLabel?: string
): string {
  const display = formatDisplayTime(time.slice(0, 5));
  const dateObj = new Date(`${date}T12:00:00`);
  const dateLabel = dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return periodLabel
    ? `${dateLabel} · ${periodLabel} · ${display}`
    : `${dateLabel} · ${display}`;
}
