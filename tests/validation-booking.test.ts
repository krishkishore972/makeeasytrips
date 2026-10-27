import { describe, expect, it } from "vitest";
import { parseBookingParams } from "@/lib/validation/booking";

describe("parseBookingParams", () => {
  it("parses a flight selection", () => {
    const parsed = parseBookingParams({
      type: "flight",
      id: "fl-blr-bom-03",
      depart: "2026-11-13",
      pax: "2",
      cabin: "economy",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.selection).toEqual({
      type: "flight",
      id: "fl-blr-bom-03",
      depart: "2026-11-13",
      pax: 2,
      cabin: "economy",
    });
  });

  it("parses a hotel selection", () => {
    const parsed = parseBookingParams({
      type: "hotel",
      id: "htl-bom-harbour-and-hush",
      checkin: "2026-11-13",
      checkout: "2026-11-17",
      rooms: "1",
      guests: "2",
      plan: "flex",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.selection).toMatchObject({ type: "hotel", rooms: 1, guests: 2, plan: "flex" });
  });

  it("parses a holiday selection", () => {
    const parsed = parseBookingParams({
      type: "holiday",
      slug: "susegad-by-the-sea",
      depart: "2026-12-05",
      travellers: "3",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.selection).toMatchObject({ type: "holiday", travellers: 3 });
  });

  it("uses the first value of repeated params", () => {
    const parsed = parseBookingParams({
      type: ["flight", "hotel"],
      id: ["fl-blr-bom-03", "other"],
      depart: "2026-11-13",
      pax: "2",
      cabin: "economy",
    });

    expect(parsed.selection?.type).toBe("flight");
  });

  it("asks for a selection when the type is missing", () => {
    expect(parseBookingParams({})).toEqual({
      selection: null,
      error: "Choose a flight, stay, or holiday before opening the review step.",
    });
  });

  it("rejects an unsupported booking type", () => {
    expect(parseBookingParams({ type: "train" })).toEqual({
      selection: null,
      error: "That booking type is not part of this demo. Choose a flight, stay, or holiday.",
    });
  });

  it("explains missing flight fields in plain language", () => {
    expect(
      parseBookingParams({ type: "flight", depart: "2026-11-13", pax: "2", cabin: "economy" })
        .error,
    ).toBe("That flight is missing from this link. Open the flight again and choose a fare.");
    expect(
      parseBookingParams({ type: "flight", id: "fl-blr-bom-03", pax: "2", cabin: "economy" }).error,
    ).toBe("Choose a valid travel date before reviewing this flight.");
    expect(
      parseBookingParams({
        type: "flight",
        id: "fl-blr-bom-03",
        depart: "2026-11-13",
        pax: "12",
        cabin: "economy",
      }).error,
    ).toBe("Choose between 1 and 9 travellers for this flight.");
    expect(
      parseBookingParams({
        type: "flight",
        id: "fl-blr-bom-03",
        depart: "2026-11-13",
        pax: "2",
        cabin: "first",
      }).error,
    ).toBe("Choose a valid cabin before reviewing this flight.");
  });

  it("rejects a hotel check-out that is not after check-in", () => {
    const parsed = parseBookingParams({
      type: "hotel",
      id: "htl-bom-harbour-and-hush",
      checkin: "2026-11-17",
      checkout: "2026-11-13",
      rooms: "1",
      guests: "2",
      plan: "flex",
    });

    expect(parsed.selection).toBeNull();
    expect(parsed.error).toBe("Check-out needs to be after check-in.");
  });

  it("rejects hotel values outside the demo bounds", () => {
    expect(
      parseBookingParams({
        type: "hotel",
        id: "htl-bom-harbour-and-hush",
        checkin: "2026-11-13",
        checkout: "2026-11-17",
        rooms: "5",
        guests: "2",
        plan: "flex",
      }).error,
    ).toBe("Choose between 1 and 4 rooms for this stay.");

    expect(
      parseBookingParams({
        type: "hotel",
        id: "htl-bom-harbour-and-hush",
        checkin: "2026-11-13",
        checkout: "2026-11-17",
        rooms: "1",
        guests: "2",
        plan: "vip",
      }).error,
    ).toBe("Choose a rate plan before reviewing this stay.");
  });

  it("explains missing holiday fields", () => {
    expect(
      parseBookingParams({ type: "holiday", depart: "2026-12-05", travellers: "3" }).error,
    ).toBe("That package is missing from this link. Open the holiday again and choose it.");
    expect(
      parseBookingParams({
        type: "holiday",
        slug: "susegad-by-the-sea",
        travellers: "3",
      }).error,
    ).toBe("Choose a valid departure date for this package.");
    expect(
      parseBookingParams({
        type: "holiday",
        slug: "susegad-by-the-sea",
        depart: "2026-12-05",
        travellers: "0",
      }).error,
    ).toBe("Choose between 1 and 9 travellers for this package.");
  });
});
