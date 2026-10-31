import { getCities } from "@/lib/data/cities";
import { readCollection } from "@/lib/data/mongo";
import { holidaySchema, type City, type Holiday } from "@/lib/data/schemas";
import { HolidayModel } from "@/lib/models";
import {
  HOLIDAY_DURATION_OPTIONS,
  HOLIDAY_PRICE_BAND_OPTIONS,
  HOLIDAY_THEME_OPTIONS,
  type HolidayDuration,
  type HolidayPriceBand,
  type HolidaySort,
  type HolidayTheme,
} from "@/lib/search-options";

export type HolidayQuery = {
  destination: string | null;
  themes: HolidayTheme[];
  durations: HolidayDuration[];
  priceBands: HolidayPriceBand[];
  sort: HolidaySort;
  travellers: number;
};

export type HolidayFacet = {
  value: string;
  label: string;
  count: number;
};

export type HolidayFacets = {
  destinations: HolidayFacet[];
  themes: HolidayFacet[];
  durations: HolidayFacet[];
  priceBands: HolidayFacet[];
  minPrice: number;
  maxPrice: number;
};

export async function getHolidays(): Promise<Holiday[]> {
  return readCollection(HolidayModel, holidaySchema);
}

export async function getHolidayBySlug(slug: string): Promise<Holiday | undefined> {
  const holidays = await getHolidays();
  return holidays.find((holiday) => holiday.slug === slug);
}

export function holidayDurationFor(days: number): HolidayDuration {
  if (days <= 3) return "short";
  if (days <= 5) return "medium";
  return "long";
}

export function holidayPriceBandFor(price: number): HolidayPriceBand {
  if (price < 20000) return "under-20k";
  if (price < 35000) return "20k-35k";
  if (price <= 50000) return "35k-50k";
  return "over-50k";
}

export async function searchHolidays(query: HolidayQuery): Promise<Holiday[]> {
  const holidays = await getHolidays();
  const results = holidays.filter((holiday) => {
    if (query.destination && holiday.city_code !== query.destination) return false;
    if (query.themes.length > 0 && !query.themes.some((theme) => holiday.themes.includes(theme))) {
      return false;
    }
    if (query.durations.length > 0 && !query.durations.includes(holidayDurationFor(holiday.days))) {
      return false;
    }
    if (
      query.priceBands.length > 0 &&
      !query.priceBands.includes(holidayPriceBandFor(holiday.price_per_person))
    ) {
      return false;
    }
    return true;
  });

  results.sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return a.price_per_person - b.price_per_person;
      case "price-desc":
        return b.price_per_person - a.price_per_person;
      case "rating":
        return b.rating - a.rating || b.review_count - a.review_count;
      case "duration":
        return b.days - a.days || a.price_per_person - b.price_per_person;
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          a.price_per_person - b.price_per_person
        );
    }
  });

  return results;
}

export function buildHolidayFacets(holidays: Holiday[]): HolidayFacets {
  const destinations = new Map<string, HolidayFacet>();
  const themes = new Map<string, HolidayFacet>();
  const durations = new Map<string, HolidayFacet>();
  const priceBands = new Map<string, HolidayFacet>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const holiday of holidays) {
    const destination = destinations.get(holiday.city_code) ?? {
      value: holiday.city_code,
      label: holiday.city_code,
      count: 0,
    };
    destination.count += 1;
    destinations.set(holiday.city_code, destination);

    for (const theme of holiday.themes) {
      const facet = themes.get(theme) ?? { value: theme, label: theme, count: 0 };
      facet.count += 1;
      themes.set(theme, facet);
    }

    const durationValue = holidayDurationFor(holiday.days);
    const duration = durations.get(durationValue) ?? {
      value: durationValue,
      label: durationValue,
      count: 0,
    };
    duration.count += 1;
    durations.set(durationValue, duration);

    const bandValue = holidayPriceBandFor(holiday.price_per_person);
    const band = priceBands.get(bandValue) ?? { value: bandValue, label: bandValue, count: 0 };
    band.count += 1;
    priceBands.set(bandValue, band);

    minPrice = Math.min(minPrice, holiday.price_per_person);
    maxPrice = Math.max(maxPrice, holiday.price_per_person);
  }

  const themeOrder = new Map(HOLIDAY_THEME_OPTIONS.map((option, index) => [option.value, index]));
  const durationOrder = new Map(
    HOLIDAY_DURATION_OPTIONS.map((option, index) => [option.value, index]),
  );
  const priceOrder = new Map(
    HOLIDAY_PRICE_BAND_OPTIONS.map((option, index) => [option.value, index]),
  );

  return {
    destinations: [...destinations.values()].sort((a, b) => b.count - a.count),
    themes: [...themes.values()].sort(
      (a, b) =>
        (themeOrder.get(a.value as HolidayTheme) ?? 99) -
        (themeOrder.get(b.value as HolidayTheme) ?? 99),
    ),
    durations: [...durations.values()].sort(
      (a, b) =>
        (durationOrder.get(a.value as HolidayDuration) ?? 99) -
        (durationOrder.get(b.value as HolidayDuration) ?? 99),
    ),
    priceBands: [...priceBands.values()].sort(
      (a, b) =>
        (priceOrder.get(a.value as HolidayPriceBand) ?? 99) -
        (priceOrder.get(b.value as HolidayPriceBand) ?? 99),
    ),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
  };
}

export async function getHolidayDestinations(): Promise<City[]> {
  const [cities, holidays] = await Promise.all([getCities(), getHolidays()]);
  const codes = new Set(holidays.map((holiday) => holiday.city_code));

  return cities
    .filter((city) => codes.has(city.code))
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
}

export async function getHolidayCityStats(): Promise<
  Map<string, { count: number; minPrice: number }>
> {
  const holidays = await getHolidays();
  const stats = new Map<string, { count: number; minPrice: number }>();

  for (const holiday of holidays) {
    const existing = stats.get(holiday.city_code);
    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, holiday.price_per_person);
    } else {
      stats.set(holiday.city_code, { count: 1, minPrice: holiday.price_per_person });
    }
  }

  return stats;
}

export async function getFeaturedHolidays(limit = 4): Promise<Holiday[]> {
  const holidays = await getHolidays();
  return holidays
    .filter((holiday) => holiday.featured)
    .sort((a, b) => b.rating - a.rating || a.price_per_person - b.price_per_person)
    .slice(0, limit);
}

export async function getSimilarHolidays(holiday: Holiday, limit = 3): Promise<Holiday[]> {
  const holidays = await getHolidays();

  return holidays
    .filter((candidate) => candidate.id !== holiday.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.city_code === holiday.city_code ? 2 : 0) +
        candidate.themes.filter((theme) => holiday.themes.includes(theme)).length,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.rating - a.candidate.rating ||
        a.candidate.price_per_person - b.candidate.price_per_person,
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
