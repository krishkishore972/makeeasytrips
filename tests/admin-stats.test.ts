import { describe, expect, it } from "vitest";
import {
  buildEnquiryStats,
  istDayKey,
  istDayStart,
  parseStatsRange,
  safeItemHref,
  type StatsEnquiryRow,
} from "@/lib/admin/stats";

const NOW = new Date("2026-11-11T06:00:00.000Z"); // 11:30 IST

function row(overrides: Partial<StatsEnquiryRow> = {}): StatsEnquiryRow {
  return {
    service: "hotel",
    title: "Harbour House",
    itemId: "stay-harbour-house",
    itemHref: "/hotels/stay-harbour-house",
    status: "new",
    createdAt: new Date("2026-11-11T02:00:00.000Z"),
    ...overrides,
  };
}

describe("admin stats range", () => {
  it("accepts 7, 30, and 90 and defaults to 30", () => {
    expect(parseStatsRange("7")).toBe(7);
    expect(parseStatsRange("30")).toBe(30);
    expect(parseStatsRange(["90"])).toBe(90);
    expect(parseStatsRange("365")).toBe(30);
    expect(parseStatsRange(undefined)).toBe(30);
    expect(parseStatsRange("nonsense")).toBe(30);
  });

  it("uses Indian calendar-day boundaries", () => {
    const start = istDayStart(NOW, 0);

    expect(start.toISOString()).toBe("2026-11-10T18:30:00.000Z");
    expect(istDayKey(new Date("2026-11-10T20:00:00.000Z"))).toBe("2026-11-11");
    expect(istDayKey(new Date("2026-11-10T18:29:59.000Z"))).toBe("2026-11-10");
  });

  it("only accepts internal catalogue links", () => {
    expect(safeItemHref("/hotels/stay-1")).toBe("/hotels/stay-1");
    expect(safeItemHref("/holidays/goa-long-weekend")).toBe("/holidays/goa-long-weekend");
    expect(safeItemHref("https://example.com/hotels/stay-1")).toBeUndefined();
    expect(safeItemHref("//example.com/hotels/stay-1")).toBeUndefined();
    expect(safeItemHref("/admin")).toBeUndefined();
    expect(safeItemHref(undefined)).toBeUndefined();
  });
});

describe("buildEnquiryStats", () => {
  const enquiries: StatsEnquiryRow[] = [
    row({
      id: "1",
      name: "Asha",
      phone: "9876543210",
      createdAt: new Date("2026-11-11T02:00:00.000Z"),
      status: undefined,
    }),
    row({
      id: "2",
      name: "Bilal",
      phone: "9876543211",
      createdAt: new Date("2026-11-09T02:00:00.000Z"),
      status: "contacted",
    }),
    row({
      id: "3",
      name: "Chen",
      phone: "9876543212",
      service: "car",
      title: "Mahindra XUV700",
      itemId: "car-xuv700",
      itemHref: "/rent-a-car/car-xuv700",
      status: "closed",
      createdAt: new Date("2026-11-10T02:00:00.000Z"),
    }),
    row({
      id: "4",
      name: "Divya",
      phone: "9876543213",
      service: "flight",
      title: "BLR → BOM · IndiGo 6E 521",
      itemId: "flight-1",
      itemHref: "/flights/flight-1",
      createdAt: new Date("2026-11-01T02:00:00.000Z"),
    }),
    row({
      id: "5",
      name: "Esha",
      phone: "9876543214",
      service: "holiday",
      title: "Goa Long Weekend",
      itemId: null,
      itemHref: null,
      createdAt: new Date("2026-11-08T02:00:00.000Z"),
    }),
    row({
      id: "6",
      name: "Farah",
      phone: "9876543215",
      service: "holiday",
      title: "Goa Long Weekend",
      itemId: null,
      itemHref: null,
      createdAt: new Date("2026-11-07T02:00:00.000Z"),
    }),
  ];

  it("counts only the selected range and keeps zero slices", () => {
    const stats = buildEnquiryStats(enquiries, { range: 7, now: NOW });

    expect(stats.enquiriesInRange).toBe(5);
    expect(stats.serviceSplit).toEqual([
      { service: "flight", label: "Flight", count: 0 },
      { service: "hotel", label: "Stay", count: 2 },
      { service: "holiday", label: "Holiday", count: 2 },
      { service: "car", label: "Car rental", count: 1 },
    ]);
    expect(stats.statusSplit).toEqual([
      { status: "new", label: "New", count: 3 },
      { status: "contacted", label: "Contacted", count: 1 },
      { status: "closed", label: "Closed", count: 1 },
    ]);
  });

  it("groups repeat interest by item id and falls back to title", () => {
    const stats = buildEnquiryStats(enquiries, { range: 30, now: NOW });
    const byKey = new Map(stats.topItems.map((item) => [item.key, item]));

    expect(byKey.get("hotel:stay-harbour-house")?.count).toBe(2);
    expect(byKey.get("holiday:goa long weekend")?.count).toBe(2);
    expect(byKey.get("car:car-xuv700")?.count).toBe(1);
    expect(stats.topItems[0]?.title).toBe("Harbour House");
  });

  it("builds a 30-day trend with IST day keys", () => {
    const stats = buildEnquiryStats(enquiries, { range: 7, now: NOW });
    const byDate = new Map(stats.trend.map((point) => [point.date, point.count]));

    expect(stats.trend).toHaveLength(30);
    expect(stats.trend[29]?.date).toBe("2026-11-11");
    expect(byDate.get("2026-11-11")).toBe(1);
    expect(byDate.get("2026-11-09")).toBe(1);
    expect(byDate.get("2026-11-01")).toBe(1);
    expect(stats.trend.reduce((sum, point) => sum + point.count, 0)).toBe(6);
  });

  it("returns the newest eight enquiries with safe links", () => {
    const stats = buildEnquiryStats(enquiries, { range: 30, now: NOW });

    expect(stats.recentEnquiries.map((enquiry) => enquiry.name)).toEqual([
      "Asha",
      "Chen",
      "Bilal",
      "Esha",
      "Farah",
      "Divya",
    ]);
    expect(stats.recentEnquiries[0]).toMatchObject({
      phone: "9876543210",
      serviceLabel: "Stay",
      href: "/hotels/stay-harbour-house",
      status: "new",
    });
    expect(stats.recentEnquiries[4]?.title).toBe("Goa Long Weekend");
    expect(stats.recentEnquiries[4]?.href).toBeUndefined();
  });

  it("handles an empty dataset", () => {
    const stats = buildEnquiryStats([], { range: 30, now: NOW });

    expect(stats.enquiriesInRange).toBe(0);
    expect(stats.topItems).toEqual([]);
    expect(stats.recentEnquiries).toEqual([]);
    expect(stats.trend).toHaveLength(30);
    expect(stats.statusSplit.every((slice) => slice.count === 0)).toBe(true);
  });
});
