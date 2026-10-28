import {
  addDaysISO,
  defaultRentalEnd,
  defaultRentalStart,
  isMonday,
  isValidISODate,
  isValidISODateTime,
  nightsBetween,
  rentalDaysFor,
  rentalHoursBetween,
  todayISO,
} from "@/lib/dates";
import type { CarQuery } from "@/lib/data/cars";
import type { FlightQuery } from "@/lib/data/flights";
import type { HolidayQuery } from "@/lib/data/holidays";
import type { HotelQuery } from "@/lib/data/hotels";
import {
  amenityFilterValues,
  cabinValues,
  carFuelValues,
  carBudgetValues,
  carModeValues,
  carRatingValues,
  carSeatBandValues,
  carSortValues,
  carTransmissionValues,
  carTypeValues,
  departureWindowValues,
  durationBandValues,
  flightSortValues,
  holidayDurationValues,
  holidayPriceBandValues,
  holidaySortValues,
  holidayThemeValues,
  hotelSortValues,
  OFFER_CATEGORY_OPTIONS,
  priceBandValues,
  starValues,
  stopValues,
  type AmenityFilter,
  type Cabin,
  type CarBudget,
  type CarFuel,
  type CarMode,
  type CarSeatBand,
  type CarSort,
  type CarTransmission,
  type CarType,
  type FlightSort,
  type HolidayDuration,
  type HolidayPriceBand,
  type HolidaySort,
  type HolidayTheme,
  type HotelSort,
  type OfferCategory,
  type PriceBand,
} from "@/lib/search-options";
import { firstParam } from "@/lib/utils";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ParsedFlightSearch = {
  query: FlightQuery;
  hasRoute: boolean;
  error: string | null;
};

export type StayQuery = {
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  nights: number;
  error: string | null;
};

export type ParsedHotelSearch = {
  query: HotelQuery;
  hasCity: boolean;
  error: string | null;
};

export type RentalQuery = {
  start: string;
  end: string;
  hours: number;
  days: number;
  error: string | null;
};

export type ParsedCarSearch = {
  query: CarQuery;
  hasCity: boolean;
  error: string | null;
};

export type ParsedHolidaySearch = {
  query: HolidayQuery;
  hasFilters: boolean;
  error: string | null;
};

export type ParsedOfferSearch = {
  category: OfferCategory;
  error: string | null;
};

function raw(params: RawSearchParams, key: string) {
  return firstParam(params[key])?.trim() || undefined;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function listOf<T extends string>(value: string | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  const seen = new Set<T>();
  for (const item of value.split(",")) {
    const candidate = item.trim() as T;
    if (allowed.includes(candidate)) seen.add(candidate);
  }
  return [...seen];
}

function boundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function cityCode(value: string | undefined) {
  const code = value?.toUpperCase();
  return code && /^[A-Z]{3}$/.test(code) ? code : null;
}

export function parseFlightSearchParams(params: RawSearchParams): ParsedFlightSearch {
  const today = todayISO();
  const from = cityCode(raw(params, "from"));
  const to = cityCode(raw(params, "to"));
  const departRaw = raw(params, "depart");
  const returnRaw = raw(params, "return");

  const depart = isValidISODate(departRaw) ? departRaw : addDaysISO(today, 14);
  const returnDate = isValidISODate(returnRaw) ? returnRaw : null;

  const cabin: Cabin = oneOf(raw(params, "cabin")?.toLowerCase(), cabinValues, "economy");
  const sort: FlightSort = oneOf(raw(params, "sort"), flightSortValues, "best");
  const stops = listOf(raw(params, "stops"), stopValues);
  const windows = listOf(raw(params, "window"), departureWindowValues);
  const durations = listOf(raw(params, "duration"), durationBandValues);
  const airlines = (raw(params, "airlines") ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value) => /^[A-Z0-9]{2}$/.test(value));
  const refundableOnly = ["1", "true"].includes(raw(params, "refundable") ?? "");

  const hasRoute = Boolean(from && to);
  let error: string | null = null;

  if (raw(params, "from") && !from) error = "That departure airport code is not valid.";
  else if (raw(params, "to") && !to) error = "That destination airport code is not valid.";
  else if (from && to && from === to) error = "Choose two different cities for this search.";
  else if (departRaw && !isValidISODate(departRaw)) error = "Choose a valid departure date.";
  else if (returnRaw && !isValidISODate(returnRaw)) error = "Choose a valid return date.";
  else if (returnDate && returnDate <= depart) {
    error = "The return date needs to be after the departure date.";
  } else if ((from && !to) || (!from && to)) {
    error = "Choose both a departure city and a destination.";
  }

  return {
    query: {
      from,
      to,
      depart,
      returnDate,
      pax: boundedInt(raw(params, "pax"), 1, 1, 9),
      cabin,
      sort,
      stops,
      airlines,
      windows,
      durations,
      refundableOnly,
    },
    hasRoute,
    error,
  };
}

export function parseStayParams(params: RawSearchParams): StayQuery {
  const today = todayISO();
  const checkInRaw = raw(params, "checkin");
  const checkOutRaw = raw(params, "checkout");

  const checkIn = isValidISODate(checkInRaw) ? checkInRaw : addDaysISO(today, 14);
  const checkOut = isValidISODate(checkOutRaw) ? checkOutRaw : addDaysISO(checkIn, 2);

  let error: string | null = null;

  if (checkInRaw && !isValidISODate(checkInRaw)) error = "Choose a valid check-in date.";
  else if (checkOutRaw && !isValidISODate(checkOutRaw)) error = "Choose a valid check-out date.";
  else if (checkOut <= checkIn) error = "Check-out needs to be after check-in.";

  return {
    checkIn,
    checkOut,
    rooms: boundedInt(raw(params, "rooms"), 1, 1, 4),
    guests: boundedInt(raw(params, "guests"), 2, 1, 12),
    nights: nightsBetween(checkIn, checkOut),
    error,
  };
}

export function parseHotelSearchParams(params: RawSearchParams): ParsedHotelSearch {
  const city = cityCode(raw(params, "city"));
  const stay = parseStayParams(params);
  const sort: HotelSort = oneOf(raw(params, "sort"), hotelSortValues, "recommended");
  const priceBands = listOf(raw(params, "price"), priceBandValues);
  const stars = (raw(params, "stars") ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value): value is (typeof starValues)[number] =>
      starValues.includes(value as (typeof starValues)[number]),
    );
  const ratingRaw = raw(params, "rating");
  const minRating = ratingRaw && ["8", "8.5", "9"].includes(ratingRaw) ? Number(ratingRaw) : null;
  const amenities = listOf(raw(params, "amenities"), amenityFilterValues);
  const breakfastOnly = ["1", "true"].includes(raw(params, "breakfast") ?? "");
  const cancellationOnly = ["1", "true"].includes(raw(params, "cancel") ?? "");

  const hasCity = Boolean(city);
  let error: string | null = null;

  if (raw(params, "city") && !city) error = "That city code is not valid.";
  else if (stay.error) error = stay.error;

  return {
    query: {
      city,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      rooms: stay.rooms,
      guests: stay.guests,
      sort,
      priceBands: priceBands as PriceBand[],
      stars,
      minRating,
      amenities: amenities as AmenityFilter[],
      breakfastOnly,
      cancellationOnly,
    },
    hasCity,
    error,
  };
}

export function parseRentalParams(params: RawSearchParams): RentalQuery {
  const startRaw = raw(params, "start");
  const endRaw = raw(params, "end");

  const start = isValidISODateTime(startRaw) ? startRaw : defaultRentalStart();
  const end = isValidISODateTime(endRaw) ? endRaw : defaultRentalEnd(start);

  let error: string | null = null;
  let hours = rentalHoursBetween(start, end);

  if (startRaw && !isValidISODateTime(startRaw)) {
    error = "Choose a valid pick-up date and time.";
  } else if (endRaw && !isValidISODateTime(endRaw)) {
    error = "Choose a valid drop-off date and time.";
  } else if (hours === null) {
    error = "Drop-off needs to be after pick-up.";
  }

  if (hours !== null && hours > 30 * 24) {
    error = "This demo caps a single rental at 30 days.";
  }

  if (hours === null) hours = 48;

  return {
    start,
    end,
    hours,
    days: rentalDaysFor(hours),
    error,
  };
}

export function parseCarSearchParams(params: RawSearchParams): ParsedCarSearch {
  const city = cityCode(raw(params, "city"));
  const rental = parseRentalParams(params);
  const mode: CarMode = oneOf(raw(params, "mode")?.toLowerCase(), carModeValues, "daily");
  const sort: CarSort = oneOf(raw(params, "sort"), carSortValues, "recommended");
  const types = listOf(raw(params, "type"), carTypeValues);
  const transmissions = listOf(raw(params, "transmission"), carTransmissionValues);
  const fuels = listOf(raw(params, "fuel"), carFuelValues);
  const seatBands = listOf(raw(params, "seats"), carSeatBandValues);
  const budgets = listOf(raw(params, "budget"), carBudgetValues);
  const ratingRaw = raw(params, "rating");
  const minRating =
    ratingRaw && carRatingValues.includes(ratingRaw as (typeof carRatingValues)[number])
      ? Number(ratingRaw)
      : null;
  const yearRaw = raw(params, "year");
  const minYear = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;
  const distanceRaw = raw(params, "distance");
  const maxDistance = distanceRaw ? boundedInt(distanceRaw, 30, 1, 100) : null;
  const fastagOnly = ["1", "true"].includes(raw(params, "fastag") ?? "");
  const deliveryOnly = ["1", "true"].includes(raw(params, "delivery") ?? "");

  let error: string | null = null;

  if (raw(params, "city") && !city) error = "That city code is not valid.";
  else if (rental.error) error = rental.error;
  else if (mode === "subscription" && rental.days < 7) {
    error = "Subscription rentals need at least 7 days. Choose a later drop-off or Daily Drives.";
  } else if (mode === "weekday") {
    if (!isMonday(rental.start.slice(0, 10))) {
      error = "Weekday Pass pick-ups start on a Monday.";
    } else if (rental.days < 5) {
      error = "Weekday Pass needs Monday to Friday, so at least 5 days.";
    }
  }

  return {
    query: {
      city,
      start: rental.start,
      end: rental.end,
      hours: rental.hours,
      days: rental.days,
      mode,
      sort,
      types: types as CarType[],
      transmissions: transmissions as CarTransmission[],
      fuels: fuels as CarFuel[],
      seatBands: seatBands as CarSeatBand[],
      budgets: budgets as CarBudget[],
      minRating,
      minYear,
      maxDistance,
      fastagOnly,
      deliveryOnly,
    },
    hasCity: Boolean(city),
    error,
  };
}

export function parseHolidaySearchParams(params: RawSearchParams): ParsedHolidaySearch {
  const destination = cityCode(raw(params, "destination"));
  const sort: HolidaySort = oneOf(raw(params, "sort"), holidaySortValues, "recommended");
  const themes = listOf(raw(params, "theme")?.toLowerCase(), holidayThemeValues);
  const durations = listOf(raw(params, "duration"), holidayDurationValues);
  const priceBands = listOf(raw(params, "price"), holidayPriceBandValues);

  let error: string | null = null;
  if (raw(params, "destination") && !destination) {
    error = "That destination code is not valid.";
  }

  const hasFilters = Boolean(
    destination || themes.length > 0 || durations.length > 0 || priceBands.length > 0,
  );

  return {
    query: {
      destination,
      themes: themes as HolidayTheme[],
      durations: durations as HolidayDuration[],
      priceBands: priceBands as HolidayPriceBand[],
      sort,
      travellers: boundedInt(raw(params, "travellers"), 2, 1, 9),
    },
    hasFilters,
    error,
  };
}

export function parseOfferSearchParams(params: RawSearchParams): ParsedOfferSearch {
  const requested = raw(params, "category")?.toLowerCase();
  const visibleCategories = OFFER_CATEGORY_OPTIONS.map((option) => option.value);
  const category: OfferCategory = oneOf(requested, visibleCategories, "all");

  return {
    category,
    error:
      requested && !visibleCategories.includes(requested as OfferCategory)
        ? "That offer category is not available right now."
        : null,
  };
}
