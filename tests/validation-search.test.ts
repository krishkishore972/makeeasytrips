import { describe, expect, it } from "vitest";
import { isValidISODate } from "@/lib/dates";
import {
  parseFlightSearchParams,
  parseHolidaySearchParams,
  parseHotelSearchParams,
  parseOfferSearchParams,
  parseStayParams,
} from "@/lib/validation/search";

describe("parseFlightSearchParams", () => {
  it("reads a complete route", () => {
    const parsed = parseFlightSearchParams({
      from: "blr",
      to: "bom",
      depart: "2026-11-13",
      return: "2026-11-17",
      pax: "3",
      cabin: "business",
      sort: "cheapest",
      stops: "0,1",
      airlines: "cw, nope",
      window: "morning",
      duration: "short",
      refundable: "1",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.hasRoute).toBe(true);
    expect(parsed.query).toMatchObject({
      from: "BLR",
      to: "BOM",
      depart: "2026-11-13",
      returnDate: "2026-11-17",
      pax: 3,
      cabin: "business",
      sort: "cheapest",
      stops: ["0", "1"],
      airlines: ["CW"],
      windows: ["morning"],
      durations: ["short"],
      refundableOnly: true,
    });
  });

  it("falls back to safe defaults and a future date", () => {
    const parsed = parseFlightSearchParams({});

    expect(parsed.error).toBeNull();
    expect(parsed.hasRoute).toBe(false);
    expect(isValidISODate(parsed.query.depart)).toBe(true);
    expect(parsed.query).toMatchObject({ pax: 1, cabin: "economy", sort: "best" });
  });

  it("rejects invalid city codes", () => {
    expect(parseFlightSearchParams({ from: "B", to: "BOM" }).error).toBe(
      "That departure airport code is not valid.",
    );
    expect(parseFlightSearchParams({ from: "BLR", to: "ZZZZ" }).error).toBe(
      "That destination airport code is not valid.",
    );
  });

  it("rejects identical and incomplete routes", () => {
    expect(parseFlightSearchParams({ from: "BLR", to: "BLR" }).error).toBe(
      "Choose two different cities for this search.",
    );
    expect(parseFlightSearchParams({ from: "BLR" }).error).toBe(
      "Choose both a departure city and a destination.",
    );
    expect(parseFlightSearchParams({ to: "BOM" }).error).toBe(
      "Choose both a departure city and a destination.",
    );
  });

  it("rejects bad and reversed dates", () => {
    expect(parseFlightSearchParams({ from: "BLR", to: "BOM", depart: "2026-02-30" }).error).toBe(
      "Choose a valid departure date.",
    );
    expect(parseFlightSearchParams({ from: "BLR", to: "BOM", return: "2026-13-01" }).error).toBe(
      "Choose a valid return date.",
    );
    expect(
      parseFlightSearchParams({
        from: "BLR",
        to: "BOM",
        depart: "2026-11-17",
        return: "2026-11-13",
      }).error,
    ).toBe("The return date needs to be after the departure date.");
  });

  it("clamps traveller counts and ignores unknown filters", () => {
    const parsed = parseFlightSearchParams({
      from: "BLR",
      to: "BOM",
      pax: "10",
      cabin: "first",
      sort: "slowest",
      stops: "2",
    });

    expect(parsed.query.pax).toBe(1);
    expect(parsed.query.cabin).toBe("economy");
    expect(parsed.query.sort).toBe("best");
    expect(parsed.query.stops).toEqual([]);
  });
});

describe("parseStayParams", () => {
  it("computes nights for a valid stay", () => {
    const stay = parseStayParams({
      checkin: "2026-11-13",
      checkout: "2026-11-17",
      rooms: "2",
      guests: "4",
    });

    expect(stay).toMatchObject({
      checkIn: "2026-11-13",
      checkOut: "2026-11-17",
      rooms: 2,
      guests: 4,
      nights: 4,
      error: null,
    });
  });

  it("defaults to a two-night stay from today", () => {
    const stay = parseStayParams({});

    expect(isValidISODate(stay.checkIn)).toBe(true);
    expect(stay.nights).toBe(2);
    expect(stay.rooms).toBe(1);
    expect(stay.guests).toBe(2);
  });

  it("rejects invalid and reversed dates", () => {
    expect(parseStayParams({ checkin: "nope" }).error).toBe("Choose a valid check-in date.");
    expect(parseStayParams({ checkout: "2026-02-30" }).error).toBe(
      "Choose a valid check-out date.",
    );
    expect(parseStayParams({ checkin: "2026-11-17", checkout: "2026-11-13" }).error).toBe(
      "Check-out needs to be after check-in.",
    );
  });

  it("clamps rooms and guests", () => {
    const stay = parseStayParams({ rooms: "9", guests: "99" });

    expect(stay.rooms).toBe(1);
    expect(stay.guests).toBe(2);
  });
});

describe("parseHotelSearchParams", () => {
  it("reads city, dates, and filters", () => {
    const parsed = parseHotelSearchParams({
      city: "goi",
      checkin: "2026-11-13",
      checkout: "2026-11-17",
      stars: "5,4,2",
      rating: "8.5",
      price: "mid,luxury,bogus",
      amenities: "pool,spa,bogus",
      breakfast: "true",
      cancel: "1",
      sort: "rating",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.hasCity).toBe(true);
    expect(parsed.query).toMatchObject({
      city: "GOI",
      stars: [5, 4],
      minRating: 8.5,
      priceBands: ["mid", "luxury"],
      amenities: ["pool", "spa"],
      breakfastOnly: true,
      cancellationOnly: true,
      sort: "rating",
    });
  });

  it("reports an invalid city and propagates date errors", () => {
    expect(parseHotelSearchParams({ city: "GO" }).error).toBe("That city code is not valid.");
    expect(
      parseHotelSearchParams({
        city: "GOI",
        checkin: "2026-11-17",
        checkout: "2026-11-13",
      }).error,
    ).toBe("Check-out needs to be after check-in.");
  });
});

describe("parseHolidaySearchParams", () => {
  it("reads destination, theme, duration, and budget", () => {
    const parsed = parseHolidaySearchParams({
      destination: "ixl",
      theme: "mountains,heritage,bogus",
      duration: "long",
      price: "over-50k",
      sort: "duration",
      travellers: "4",
    });

    expect(parsed.error).toBeNull();
    expect(parsed.hasFilters).toBe(true);
    expect(parsed.query).toMatchObject({
      destination: "IXL",
      themes: ["mountains", "heritage"],
      durations: ["long"],
      priceBands: ["over-50k"],
      sort: "duration",
      travellers: 4,
    });
  });

  it("defaults to no filters and two travellers", () => {
    const parsed = parseHolidaySearchParams({});

    expect(parsed.hasFilters).toBe(false);
    expect(parsed.query.travellers).toBe(2);
    expect(parsed.query.destination).toBeNull();
  });

  it("reports an invalid destination and clamps travellers", () => {
    expect(parseHolidaySearchParams({ destination: "PARIS" }).error).toBe(
      "That destination code is not valid.",
    );
    expect(parseHolidaySearchParams({ travellers: "12" }).query.travellers).toBe(2);
  });
});

describe("parseOfferSearchParams", () => {
  it("normalises the category", () => {
    expect(parseOfferSearchParams({ category: "HOLIDAYS" })).toEqual({
      category: "holidays",
      error: null,
    });
    expect(parseOfferSearchParams({}).category).toBe("all");
  });

  it("reports an unknown category", () => {
    expect(parseOfferSearchParams({ category: "cruises" })).toEqual({
      category: "all",
      error: "That offer category does not exist.",
    });
  });
});
