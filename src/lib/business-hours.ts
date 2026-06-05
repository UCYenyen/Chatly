import {
  DAY_LABELS,
  DEFAULT_TIMEZONE,
  isWeeklyHours,
  type BusinessHoursStatus,
  type DayKey,
  type WeeklyHours,
} from "@/types/business-hours.md";

export interface BusinessHoursConfig {
  handoverHoursEnabled: boolean;
  timezone: string | null;
  businessHours: unknown;
}

interface ZonedNow {
  dayIndex: number;
  minutes: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function toMinutes(hhmm: string): number {
  const [hours, mins] = hhmm.split(":");
  return Number(hours) * 60 + Number(mins);
}

function getZonedNow(now: Date, timeZone: string): ZonedNow {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const rawHour = parts.find((p) => p.type === "hour")?.value ?? "0";
  const minutePart = parts.find((p) => p.type === "minute")?.value ?? "0";
  const hour = rawHour === "24" ? 0 : Number(rawHour);
  return {
    dayIndex: WEEKDAY_INDEX[weekday] ?? 0,
    minutes: hour * 60 + Number(minutePart),
  };
}

function isOpenAt(hours: WeeklyHours, zoned: ZonedNow): boolean {
  const day = hours[String(zoned.dayIndex) as DayKey];
  if (day.closed) return false;
  const openMin = toMinutes(day.open);
  const closeMin = toMinutes(day.close);
  if (openMin === closeMin) return false;
  if (closeMin > openMin) {
    return zoned.minutes >= openMin && zoned.minutes < closeMin;
  }
  return zoned.minutes >= openMin || zoned.minutes < closeMin;
}

function buildNextOpenLabel(
  hours: WeeklyHours,
  zoned: ZonedNow,
): string | null {
  for (let offset = 0; offset <= 7; offset += 1) {
    const dayIndex = (zoned.dayIndex + offset) % 7;
    const day = hours[String(dayIndex) as DayKey];
    if (day.closed) continue;
    const openMin = toMinutes(day.open);
    if (offset === 0 && zoned.minutes >= openMin) continue;
    if (offset === 0) return `hari ini jam ${day.open}`;
    if (offset === 1) return `besok jam ${day.open}`;
    return `${DAY_LABELS[String(dayIndex) as DayKey]} jam ${day.open}`;
  }
  return null;
}

export function getBusinessHoursStatus(
  config: BusinessHoursConfig,
  now: Date,
): BusinessHoursStatus {
  if (!config.handoverHoursEnabled || !isWeeklyHours(config.businessHours)) {
    return { isOpen: true, nextOpenLabel: null };
  }

  const timeZone = config.timezone ?? DEFAULT_TIMEZONE;
  const zoned = getZonedNow(now, timeZone);
  const hours = config.businessHours;

  if (isOpenAt(hours, zoned)) {
    return { isOpen: true, nextOpenLabel: null };
  }

  return { isOpen: false, nextOpenLabel: buildNextOpenLabel(hours, zoned) };
}
