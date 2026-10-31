import { getCities } from "@/lib/data/cities";
import { readCollection } from "@/lib/data/mongo";
import { flightSchema, type City, type Flight } from "@/lib/data/schemas";
import { FlightModel } from "@/lib/models";
import {
  type Cabin,
  type DepartureWindow,
  type DurationBand,
  type FlightSort,
  type StopFilter,
} from "@/lib/search-options";

const fareKey = {
  economy: "fare_economy",
  premium: "fare_premium",
  business: "fare_business",
} as const;

export type FlightQuery = {
  from: string | null;
  to: string | null;
  depart: string | null;
  returnDate: string | null;
  pax: number;
  cabin: Cabin;
  sort: FlightSort;
  stops: StopFilter[];
  airlines: string[];
  windows: DepartureWindow[];
  durations: DurationBand[];
  refundableOnly: boolean;
};

export type FlightResult = {
  flight: Flight;
  fare: number;
  totalFare: number;
  score: number;
};

export type FlightFacet = {
  value: string;
  label: string;
  count: number;
};

export type FlightFacets = {
  airlines: FlightFacet[];
  stops: FlightFacet[];
  windows: FlightFacet[];
  durations: FlightFacet[];
  refundable: number;
  minFare: number;
  maxFare: number;
};

export async function getFlights(): Promise<Flight[]> {
  return readCollection(FlightModel, flightSchema);
}

export async function getFlightById(id: string): Promise<Flight | undefined> {
  const flights = await getFlights();
  return flights.find((flight) => flight.id === id);
}

export function fareFor(flight: Flight, cabin: Cabin) {
  return flight[fareKey[cabin]];
}

export function departureWindowFor(time: string): DepartureWindow {
  const hour = Number(time.slice(0, 2));
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function durationBandFor(minutes: number): DurationBand {
  if (minutes <= 120) return "short";
  if (minutes <= 240) return "medium";
  return "long";
}

export function flightScore(flight: Flight, fare: number) {
  return (
    fare / 1000 +
    flight.duration_minutes / 60 +
    flight.stops * 1.5 -
    (flight.refundable ? 0.4 : 0) +
    (100 - flight.on_time) / 50
  );
}

export async function searchFlights(query: FlightQuery): Promise<FlightResult[]> {
  if (!query.from || !query.to) return [];

  const flights = await getFlights();
  const results: FlightResult[] = [];

  for (const flight of flights) {
    if (flight.from_code !== query.from || flight.to_code !== query.to) continue;

    const fare = fareFor(flight, query.cabin);
    if (fare <= 0) continue;

    if (query.stops.length > 0 && !query.stops.includes(String(flight.stops) as StopFilter)) {
      continue;
    }
    if (query.airlines.length > 0 && !query.airlines.includes(flight.airline_code)) continue;
    if (
      query.windows.length > 0 &&
      !query.windows.includes(departureWindowFor(flight.depart_time))
    ) {
      continue;
    }
    if (
      query.durations.length > 0 &&
      !query.durations.includes(durationBandFor(flight.duration_minutes))
    ) {
      continue;
    }
    if (query.refundableOnly && !flight.refundable) continue;

    results.push({
      flight,
      fare,
      totalFare: fare * query.pax,
      score: flightScore(flight, fare),
    });
  }

  results.sort((a, b) => {
    switch (query.sort) {
      case "cheapest":
        return a.fare - b.fare || a.flight.duration_minutes - b.flight.duration_minutes;
      case "quickest":
        return (
          a.flight.duration_minutes - b.flight.duration_minutes ||
          a.flight.stops - b.flight.stops ||
          a.fare - b.fare
        );
      case "earliest":
        return a.flight.depart_time.localeCompare(b.flight.depart_time);
      default:
        return a.score - b.score;
    }
  });

  return results;
}

export function buildFlightFacets(flights: Flight[], cabin: Cabin): FlightFacets {
  const airlines = new Map<string, FlightFacet>();
  const stops = new Map<string, FlightFacet>();
  const windows = new Map<string, FlightFacet>();
  const durations = new Map<string, FlightFacet>();
  let refundable = 0;
  let minFare = Number.POSITIVE_INFINITY;
  let maxFare = 0;

  for (const flight of flights) {
    const airline = airlines.get(flight.airline_code) ?? {
      value: flight.airline_code,
      label: flight.airline,
      count: 0,
    };
    airline.count += 1;
    airlines.set(flight.airline_code, airline);

    const stopValue = String(flight.stops);
    const stop = stops.get(stopValue) ?? {
      value: stopValue,
      label: flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`,
      count: 0,
    };
    stop.count += 1;
    stops.set(stopValue, stop);

    const window = departureWindowFor(flight.depart_time);
    const windowFacet = windows.get(window) ?? {
      value: window,
      label: window,
      count: 0,
    };
    windowFacet.count += 1;
    windows.set(window, windowFacet);

    const band = durationBandFor(flight.duration_minutes);
    const durationFacet = durations.get(band) ?? { value: band, label: band, count: 0 };
    durationFacet.count += 1;
    durations.set(band, durationFacet);

    if (flight.refundable) refundable += 1;

    const fare = fareFor(flight, cabin);
    minFare = Math.min(minFare, fare);
    maxFare = Math.max(maxFare, fare);
  }

  return {
    airlines: [...airlines.values()].sort((a, b) => a.label.localeCompare(b.label)),
    stops: [...stops.values()].sort((a, b) => Number(a.value) - Number(b.value)),
    windows: [...windows.values()],
    durations: [...durations.values()],
    refundable,
    minFare: Number.isFinite(minFare) ? minFare : 0,
    maxFare,
  };
}

export async function getFlightCities(): Promise<City[]> {
  const [cities, flights] = await Promise.all([getCities(), getFlights()]);
  const codes = new Set<string>();
  for (const flight of flights) {
    codes.add(flight.from_code);
    codes.add(flight.to_code);
  }

  return cities
    .filter((city) => codes.has(city.code))
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
}

export type PopularRoute = {
  from: City;
  to: City;
  fare: number;
  durationMinutes: number;
};

export async function getPopularRoutes(limit = 6): Promise<PopularRoute[]> {
  const [cities, flights] = await Promise.all([getCities(), getFlights()]);
  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const routes = new Map<string, { fare: number; durationMinutes: number }>();

  for (const flight of flights) {
    if (flight.stops > 0) continue;
    const key = `${flight.from_code}-${flight.to_code}`;
    const existing = routes.get(key);
    if (!existing || flight.fare_economy < existing.fare) {
      routes.set(key, {
        fare: flight.fare_economy,
        durationMinutes: flight.duration_minutes,
      });
    }
  }

  return [...routes.entries()]
    .map(([key, value]) => {
      const [fromCode, toCode] = key.split("-");
      const from = cityByCode.get(fromCode);
      const to = cityByCode.get(toCode);
      if (!from || !to || !from.popular || !to.popular) return null;
      return {
        from,
        to,
        fare: value.fare,
        durationMinutes: value.durationMinutes,
      } satisfies PopularRoute;
    })
    .filter((route): route is PopularRoute => route !== null)
    .sort((a, b) => a.fare - b.fare)
    .slice(0, limit);
}

export async function getOtherRouteFlights(
  flight: Flight,
  cabin: Cabin = "economy",
  limit = 3,
): Promise<FlightResult[]> {
  const flights = await getFlights();

  return flights
    .filter(
      (candidate) =>
        candidate.id !== flight.id &&
        candidate.from_code === flight.from_code &&
        candidate.to_code === flight.to_code,
    )
    .map((candidate) => {
      const fare = fareFor(candidate, cabin);
      return {
        flight: candidate,
        fare,
        totalFare: fare,
        score: flightScore(candidate, fare),
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}
