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

/* -------------------------------------------------------------------------- */
/*  Self-drive rental date-times                                               */
/* -------------------------------------------------------------------------- */

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const IST_OFFSET = "+05:30";

export function isValidISODateTime(value: string | undefined | null): value is string {
  if (!value || !isoDateTimePattern.test(value)) return false;

  const [date, time] = value.split("T");
  if (!isValidISODate(date)) return false;

  const [hours, minutes] = time.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function dateTimeFromISO(value: string) {
  return new Date(`${value}:00${IST_OFFSET}`);
}

export function formatTimeLabel(value: string) {
  if (!isValidISODateTime(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateTimeFromISO(value));
}

export function formatDateTimeShort(value: string) {
  if (!isValidISODateTime(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateTimeFromISO(value));
}

export function formatDateTimeLong(value: string) {
  if (!isValidISODateTime(value)) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateTimeFromISO(value));
}

/** Whole hours between two IST date-times. Returns null when the range is invalid. */
export function rentalHoursBetween(start: string, end: string): number | null {
  if (!isValidISODateTime(start) || !isValidISODateTime(end)) return null;

  const difference = dateTimeFromISO(end).getTime() - dateTimeFromISO(start).getTime();
  if (difference <= 0) return null;

  return Math.round(difference / (60 * 60 * 1000));
}

export function rentalDaysFor(hours: number) {
  return Math.max(1, Math.ceil(hours / 24));
}

export function formatRentalDuration(hours: number) {
  const days = rentalDaysFor(hours);
  const dayLabel = `${days} ${days === 1 ? "day" : "days"}`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} · ${dayLabel} billed`;
  return `${dayLabel} · ${hours} hours`;
}

export function toDateTimeLocal(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

export function addHoursToISODateTime(value: string, hours: number) {
  if (!isValidISODateTime(value)) return value;
  return toDateTimeLocal(new Date(dateTimeFromISO(value).getTime() + hours * 60 * 60 * 1000));
}

export function defaultRentalStart() {
  return `${addDaysISO(todayISO(), 14)}T10:00`;
}

export function defaultRentalEnd(start: string) {
  return addHoursToISODateTime(start, 48);
}

export function isWeekday(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day >= 1 && day <= 5;
}

export function isMonday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 1;
}
