import { describe, expect, it } from "vitest";
import {
  addDaysISO,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatGuestLabel,
  formatMonthYear,
  formatNightLabel,
  isValidISODate,
  nightsBetween,
} from "@/lib/dates";

describe("isValidISODate", () => {
  it("accepts real calendar dates", () => {
    expect(isValidISODate("2026-11-13")).toBe(true);
    expect(isValidISODate("2028-02-29")).toBe(true);
  });

  it("rejects impossible, malformed, and empty values", () => {
    expect(isValidISODate("2026-02-30")).toBe(false);
    expect(isValidISODate("2027-02-29")).toBe(false);
    expect(isValidISODate("13-11-2026")).toBe(false);
    expect(isValidISODate("2026-1-3")).toBe(false);
    expect(isValidISODate("")).toBe(false);
    expect(isValidISODate(undefined)).toBe(false);
    expect(isValidISODate(null)).toBe(false);
  });
});

describe("addDaysISO", () => {
  it("crosses month and year boundaries", () => {
    expect(addDaysISO("2026-11-28", 5)).toBe("2026-12-03");
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysISO("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("moves backwards", () => {
    expect(addDaysISO("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("nightsBetween", () => {
  it("counts nights between dates", () => {
    expect(nightsBetween("2026-11-13", "2026-11-17")).toBe(4);
    expect(nightsBetween("2026-11-13", "2026-11-14")).toBe(1);
  });

  it("never returns less than one night", () => {
    expect(nightsBetween("2026-11-17", "2026-11-13")).toBe(1);
    expect(nightsBetween("2026-11-13", "2026-11-13")).toBe(1);
    expect(nightsBetween("nope", "2026-11-13")).toBe(1);
  });
});

describe("date formatting", () => {
  it("formats long and short dates in India time", () => {
    expect(formatDateLong("2026-11-13")).toBe("Fri, 13 Nov, 2026");
    expect(formatDateShort("2026-11-13")).toBe("Fri, 13 Nov");
    expect(formatMonthYear("2026-11-13")).toBe("November 2026");
  });

  it("returns the input when the date is invalid", () => {
    expect(formatDateLong("not-a-date")).toBe("not-a-date");
    expect(formatDateShort("not-a-date")).toBe("not-a-date");
    expect(formatMonthYear("not-a-date")).toBe("not-a-date");
  });
});

describe("duration and count labels", () => {
  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(135)).toBe("2h 15m");
  });

  it("pluralises nights, rooms, and guests", () => {
    expect(formatNightLabel(1)).toBe("1 night");
    expect(formatNightLabel(3)).toBe("3 nights");
    expect(formatGuestLabel(1, 1)).toBe("1 room · 1 guest");
    expect(formatGuestLabel(2, 4)).toBe("2 rooms · 4 guests");
  });
});
