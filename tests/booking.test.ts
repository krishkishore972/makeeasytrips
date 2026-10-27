import { describe, expect, it } from "vitest";
import {
  bookingConfirmationHref,
  bookingParams,
  bookingReference,
  bookingReviewHref,
  resolveBooking,
} from "@/lib/booking";
import type { BookingSelection } from "@/lib/validation/booking";

const flight: BookingSelection = {
  type: "flight",
  id: "fl-blr-bom-03",
  depart: "2026-11-13",
  pax: 2,
  cabin: "economy",
};

const hotel: BookingSelection = {
  type: "hotel",
  id: "htl-bom-harbour-and-hush",
  checkin: "2026-11-13",
  checkout: "2026-11-17",
  rooms: 1,
  guests: 2,
  plan: "flex",
};

const holiday: BookingSelection = {
  type: "holiday",
  slug: "susegad-by-the-sea",
  depart: "2026-12-05",
  travellers: 3,
};

describe("bookingParams", () => {
  it("serialises each selection type without leaking fields", () => {
    expect(bookingParams(flight)).toEqual({
      type: "flight",
      id: "fl-blr-bom-03",
      depart: "2026-11-13",
      pax: "2",
      cabin: "economy",
    });
    expect(bookingParams(hotel)).toMatchObject({ type: "hotel", plan: "flex", rooms: "1" });
    expect(bookingParams(holiday)).toMatchObject({ type: "holiday", travellers: "3" });
    expect(Object.keys(bookingParams(flight))).not.toContain("slug");
  });
});

describe("bookingReference", () => {
  it("is deterministic for the same selection", () => {
    expect(bookingReference(flight)).toBe(bookingReference({ ...flight }));
    expect(bookingReference(flight)).toMatch(/^TN-FL-[A-Z0-9]{6}$/);
  });

  it("changes when the selection changes", () => {
    const base = bookingReference(flight);
    expect(bookingReference({ ...flight, pax: 3 })).not.toBe(base);
    expect(bookingReference({ ...flight, cabin: "premium" })).not.toBe(base);
  });

  it("uses a type-specific prefix", () => {
    expect(bookingReference(hotel)).toMatch(/^TN-ST-[A-Z0-9]{6}$/);
    expect(bookingReference(holiday)).toMatch(/^TN-HL-[A-Z0-9]{6}$/);
  });
});

describe("booking links", () => {
  it("builds a review link from the selection", () => {
    expect(bookingReviewHref(flight)).toBe(
      "/booking/review?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy",
    );
  });

  it("adds confirmed=1 to the confirmation link", () => {
    expect(bookingConfirmationHref(holiday)).toBe(
      "/booking/confirmation?type=holiday&slug=susegad-by-the-sea&depart=2026-12-05&travellers=3&confirmed=1",
    );
  });
});

describe("resolveBooking", () => {
  it("resolves a flight with matching totals", async () => {
    const { summary, error } = await resolveBooking(flight);

    expect(error).toBeNull();
    expect(summary).not.toBeNull();
    expect(summary?.title).toBe("Bengaluru → Mumbai");
    expect(summary?.reference).toBe(bookingReference(flight));
    expect(summary?.breakdown).toMatchObject({ base: 6512, taxes: 888, total: 7400 });
    expect(summary?.breakdownRows[0]?.label).toContain("2 travellers");
    expect(summary?.productHref).toContain("/flights/fl-blr-bom-03");
    expect(summary?.nextSteps).toHaveLength(3);
  });

  it("resolves a hotel with the flex supplement and tax", async () => {
    const { summary, error } = await resolveBooking(hotel);

    expect(error).toBeNull();
    expect(summary?.title).toBe("Harbour & Hush");
    expect(summary?.breakdown).toMatchObject({ base: 77600, taxes: 13968, total: 91568 });
    expect(summary?.details.find((detail) => detail.label === "Rate plan")?.value).toContain(
      "Flex",
    );
    expect(summary?.details.find((detail) => detail.label === "Breakfast")?.value).toBe("Included");
    expect(summary?.productHref).toContain("checkin=2026-11-13");
  });

  it("resolves a holiday with per-person pricing", async () => {
    const { summary, error } = await resolveBooking(holiday);

    expect(error).toBeNull();
    expect(summary?.title).toBe("Susegad by the Sea");
    expect(summary?.breakdown).toMatchObject({ base: 73500, taxes: 3675, total: 77175 });
    expect(summary?.details.find((detail) => detail.label === "Travellers")?.value).toBe(
      "3 travellers",
    );
    expect(summary?.inclusions.length).toBeGreaterThan(0);
  });

  it("reports a product that is no longer in the catalogue", async () => {
    const result = await resolveBooking({ ...flight, id: "missing" });
    expect(result.summary).toBeNull();
    expect(result.error).toBe(
      "That flight is no longer in the demo catalogue. Choose another fare to continue.",
    );
  });

  it("rejects a holiday departure that is not published", async () => {
    const result = await resolveBooking({ ...holiday, depart: "2027-01-01" });
    expect(result.summary).toBeNull();
    expect(result.error).toBe(
      "That departure date is not available for this package. Pick another date on the package page.",
    );
  });
});
