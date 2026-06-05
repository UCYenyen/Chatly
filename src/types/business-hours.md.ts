export type DayKey = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export type WeeklyHours = Record<DayKey, DayHours>;

export interface BusinessHoursStatus {
  isOpen: boolean;
  nextOpenLabel: string | null;
}

export const DAY_KEYS: DayKey[] = ["0", "1", "2", "3", "4", "5", "6"];

export const DAY_LABELS: Record<DayKey, string> = {
  "0": "Minggu",
  "1": "Senin",
  "2": "Selasa",
  "3": "Rabu",
  "4": "Kamis",
  "5": "Jumat",
  "6": "Sabtu",
};

export const DEFAULT_TIMEZONE = "Asia/Jakarta";

export const SUPPORTED_TIMEZONES: string[] = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Tokyo",
  "UTC",
];

export function createDefaultWeeklyHours(): WeeklyHours {
  return DAY_KEYS.reduce((acc, key) => {
    acc[key] = {
      closed: key === "0",
      open: "09:00",
      close: "17:00",
    };
    return acc;
  }, {} as WeeklyHours);
}

function isHhMm(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isWeeklyHours(value: unknown): value is WeeklyHours {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return DAY_KEYS.every((key) => {
    const day = record[key];
    if (typeof day !== "object" || day === null) return false;
    const d = day as Record<string, unknown>;
    return typeof d.closed === "boolean" && isHhMm(d.open) && isHhMm(d.close);
  });
}
