const INDIA_TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 24 * 60 * 60 * 1000;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date in India as YYYY-MM-DD, independent of the server timezone. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidISODate(value: string | undefined | null): value is string {
  if (!value || !isoDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function addDaysISO(value: string, days: number) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return new Date(parsed.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Inclusive night count between two ISO dates, never below one. */
export function nightsBetween(checkIn: string, checkOut: string) {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / DAY_MS));
}

function dateFromISO(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

export function formatDateShort(value: string) {
  if (!isValidISODate(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(dateFromISO(value));
}

export function formatDateLong(value: string) {
  if (!isValidISODate(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateFromISO(value));
}

export function formatMonthYear(value: string) {
  if (!isValidISODate(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(dateFromISO(value));
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${String(rest).padStart(2, "0")}m`;
}

export function formatNightLabel(nights: number) {
  return `${nights} ${nights === 1 ? "night" : "nights"}`;
}

export function formatGuestLabel(rooms: number, guests: number) {
  return `${rooms} ${rooms === 1 ? "room" : "rooms"} · ${guests} ${guests === 1 ? "guest" : "guests"}`;
}
