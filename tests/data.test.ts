import { describe, expect, it } from "vitest";
import { getCities, getCity, getCityMap } from "@/lib/data/cities";
import {
  buildFlightFacets,
  departureWindowFor,
  durationBandFor,
  fareFor,
  getFlightById,
  getFlights,
  getPopularRoutes,
  searchFlights,
  type FlightQuery,
} from "@/lib/data/flights";
import {
  getHolidayBySlug,
  getHolidays,
  getSimilarHolidays,
  searchHolidays,
} from "@/lib/data/holidays";
import { buildHotelFacets, getHotelById, getHotels, searchHotels } from "@/lib/data/hotels";
import { getOfferCategoryCounts, getOffers, getOffersByCategory } from "@/lib/data/offers";
import type { HolidayQuery } from "@/lib/data/holidays";
import type { HotelQuery } from "@/lib/data/hotels";

const flightQuery = (overrides: Partial<FlightQuery> = {}): FlightQuery => ({
  from: "BLR",
  to: "BOM",
  depart: "2026-11-13",
  returnDate: null,
  pax: 1,
  cabin: "economy",
  sort: "best",
  stops: [],
  airlines: [],
  windows: [],
  durations: [],
  refundableOnly: false,
  ...overrides,
});

const hotelQuery = (overrides: Partial<HotelQuery> = {}): HotelQuery => ({
  city: "GOI",
  checkIn: "2026-11-13",
  checkOut: "2026-11-17",
  rooms: 1,
  guests: 2,
  sort: "recommended",
  priceBands: [],
  stars: [],
  minRating: null,
  amenities: [],
  breakfastOnly: false,
  cancellationOnly: false,
  ...overrides,
});

const holidayQuery = (overrides: Partial<HolidayQuery> = {}): HolidayQuery => ({
  destination: null,
  themes: [],
  durations: [],
  priceBands: [],
  sort: "recommended",
  travellers: 2,
  ...overrides,
});

describe("cities", () => {
  it("loads the full catalogue with unique codes", async () => {
    const cities = await getCities();
    expect(cities).toHaveLength(16);
    expect(new Set(cities.map((city) => city.code)).size).toBe(cities.length);
  });

  it("looks up a city case-insensitively and maps by code", async () => {
    const mumbai = await getCity("bom");
    expect(mumbai?.name).toBe("Mumbai");
    expect(await getCity(undefined)).toBeUndefined();
    expect((await getCityMap()).get("GOI")?.name).toBe("Goa");
  });
});

describe("flights", () => {
  it("loads flights and finds one by id", async () => {
    const flights = await getFlights();
    expect(flights.length).toBeGreaterThan(0);
    expect((await getFlightById("fl-blr-bom-03"))?.airline_code).toBe("CW");
    expect(await getFlightById("missing")).toBeUndefined();
  });

  it("picks the fare for each cabin", async () => {
    const flight = await getFlightById("fl-blr-bom-03");
    expect(flight && fareFor(flight, "economy")).toBe(3700);
    expect(flight && fareFor(flight, "premium")).toBe(5750);
    expect(flight && fareFor(flight, "business")).toBe(10550);
  });

  it("classifies departure windows and durations", () => {
    expect(departureWindowFor("05:59")).toBe("early");
    expect(departureWindowFor("06:00")).toBe("morning");
    expect(departureWindowFor("12:00")).toBe("afternoon");
    expect(departureWindowFor("18:00")).toBe("evening");
    expect(durationBandFor(120)).toBe("short");
    expect(durationBandFor(240)).toBe("medium");
    expect(durationBandFor(241)).toBe("long");
  });

  it("returns only matching routes", async () => {
    const results = await searchFlights(flightQuery());
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.flight.from_code).toBe("BLR");
      expect(result.flight.to_code).toBe("BOM");
      expect(result.totalFare).toBe(result.fare);
    }
  });

  it("sorts by cheapest, quickest, and earliest", async () => {
    const cheapest = await searchFlights(flightQuery({ sort: "cheapest" }));
    expect(cheapest.map((result) => result.fare)).toEqual(
      [...cheapest].map((result) => result.fare).sort((a, b) => a - b),
    );

    const quickest = await searchFlights(flightQuery({ sort: "quickest" }));
    expect(quickest.map((result) => result.flight.duration_minutes)).toEqual(
      [...quickest].map((result) => result.flight.duration_minutes).sort((a, b) => a - b),
    );

    const earliest = await searchFlights(flightQuery({ sort: "earliest" }));
    expect(earliest.map((result) => result.flight.depart_time)).toEqual(
      [...earliest].map((result) => result.flight.depart_time).sort(),
    );
  });

  it("applies stops, airline, and refundable filters", async () => {
    const nonstop = await searchFlights(flightQuery({ stops: ["0"] }));
    expect(nonstop.every((result) => result.flight.stops === 0)).toBe(true);

    const airline = await searchFlights(flightQuery({ airlines: ["CW"] }));
    expect(airline.every((result) => result.flight.airline_code === "CW")).toBe(true);

    const refundable = await searchFlights(flightQuery({ refundableOnly: true }));
    expect(refundable.every((result) => result.flight.refundable)).toBe(true);
  });

  it("multiplies the fare by travellers", async () => {
    const [first] = await searchFlights(flightQuery({ pax: 3 }));
    expect(first?.totalFare).toBe((first?.fare ?? 0) * 3);
  });

  it("returns nothing without a route", async () => {
    expect(await searchFlights(flightQuery({ from: null }))).toEqual([]);
  });

  it("builds facets that cover every flight", async () => {
    const flights = await getFlights();
    const facets = buildFlightFacets(flights, "economy");

    const airlineCount = facets.airlines.reduce((total, facet) => total + facet.count, 0);
    expect(airlineCount).toBe(flights.length);
    expect(facets.minFare).toBeLessThanOrEqual(facets.maxFare);
    expect(facets.refundable).toBeLessThanOrEqual(flights.length);
    expect(facets.stops.map((facet) => facet.value)).toEqual(["0", "1"]);
  });

  it("returns popular nonstop routes between popular cities", async () => {
    const routes = await getPopularRoutes(4);
    expect(routes.length).toBeLessThanOrEqual(4);
    expect(routes.every((route) => route.from.popular && route.to.popular)).toBe(true);
  });
});

describe("hotels", () => {
  it("loads hotels and finds one by id", async () => {
    const hotels = await getHotels();
    expect(hotels).toHaveLength(32);
    expect((await getHotelById("htl-bom-harbour-and-hush"))?.name).toBe("Harbour & Hush");
  });

  it("filters by city, stars, price, rating, and amenities", async () => {
    const results = await searchHotels(
      hotelQuery({ stars: [5], minRating: 9, amenities: ["wifi"] }),
    );

    expect(results.length).toBeGreaterThan(0);
    for (const hotel of results) {
      expect(hotel.city_code).toBe("GOI");
      expect(hotel.star_rating).toBe(5);
      expect(hotel.guest_rating).toBeGreaterThanOrEqual(9);
      expect(hotel.amenities).toContain("wifi");
    }
  });

  it("sorts by price and rating", async () => {
    const cheapest = await searchHotels(hotelQuery({ sort: "price-asc" }));
    expect(cheapest.map((hotel) => hotel.price_per_night)).toEqual(
      [...cheapest].map((hotel) => hotel.price_per_night).sort((a, b) => a - b),
    );

    const bestRated = await searchHotels(hotelQuery({ sort: "rating" }));
    expect(bestRated[0]?.guest_rating).toBeGreaterThanOrEqual(
      bestRated[bestRated.length - 1]?.guest_rating ?? 0,
    );
  });

  it("requires a city", async () => {
    expect(await searchHotels(hotelQuery({ city: null }))).toEqual([]);
  });

  it("builds facets that cover every hotel", async () => {
    const hotels = await getHotels();
    const facets = buildHotelFacets(hotels);
    const starCount = facets.stars.reduce((total, facet) => total + facet.count, 0);

    expect(starCount).toBe(hotels.length);
    expect(facets.breakfast).toBeLessThanOrEqual(hotels.length);
    expect(facets.minPrice).toBeLessThanOrEqual(facets.maxPrice);
  });
});

describe("holidays", () => {
  it("loads holidays and finds one by slug", async () => {
    expect(await getHolidays()).toHaveLength(12);
    expect((await getHolidayBySlug("susegad-by-the-sea"))?.title).toBe("Susegad by the Sea");
    expect(await getHolidayBySlug("missing")).toBeUndefined();
  });

  it("filters by destination, theme, duration, and price", async () => {
    const results = await searchHolidays(
      holidayQuery({ destination: "GOI", themes: ["beach"], durations: ["short"] }),
    );

    expect(results.length).toBeGreaterThan(0);
    for (const holiday of results) {
      expect(holiday.city_code).toBe("GOI");
      expect(holiday.themes).toContain("beach");
      expect(holiday.days).toBeLessThanOrEqual(3);
    }
  });

  it("sorts by price and duration", async () => {
    const cheapest = await searchHolidays(holidayQuery({ sort: "price-asc" }));
    expect(cheapest.map((holiday) => holiday.price_per_person)).toEqual(
      [...cheapest].map((holiday) => holiday.price_per_person).sort((a, b) => a - b),
    );

    const longest = await searchHolidays(holidayQuery({ sort: "duration" }));
    expect(longest[0]?.days).toBeGreaterThanOrEqual(longest[longest.length - 1]?.days ?? 0);
  });

  it("suggests similar packages without repeating the source", async () => {
    const holiday = await getHolidayBySlug("susegad-by-the-sea");
    expect(holiday).toBeDefined();
    if (!holiday) return;

    const similar = await getSimilarHolidays(holiday, 3);
    expect(similar).toHaveLength(3);
    expect(similar.every((candidate) => candidate.id !== holiday.id)).toBe(true);
  });
});

describe("offers", () => {
  it("loads offers and filters by category", async () => {
    const offers = await getOffers();
    expect(offers.length).toBeGreaterThan(0);

    const flights = await getOffersByCategory("flights");
    expect(flights.length).toBeGreaterThan(0);
    expect(flights.every((offer) => offer.category === "flights")).toBe(true);
  });

  it("counts every category, including all", async () => {
    const counts = await getOfferCategoryCounts();
    const total = counts.find((entry) => entry.value === "all")?.count;

    expect(counts[0]?.value).toBe("all");
    expect(total).toBe((await getOffers()).length);
    expect(
      counts.reduce((sum, entry) => (entry.value === "all" ? sum : sum + entry.count), 0),
    ).toBe(total);
  });
});
