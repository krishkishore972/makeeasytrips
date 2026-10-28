import { getCities } from "@/lib/data/cities";
import { getCars } from "@/lib/data/cars";
import { getHolidayCityStats, getHolidayDestinations, getHolidays } from "@/lib/data/holidays";
import { getFeaturedHotels, getHotels } from "@/lib/data/hotels";
import { getOffers } from "@/lib/data/offers";
import type { City, Holiday, Hotel, Offer } from "@/lib/data/schemas";

/**
 * The home page is an editorial edit of the catalogue, not a second catalogue.
 * These codes choose a deliberate mix of coast, mountains, heritage, and city
 * packages so the opening screen does not look like an alphabetical export.
 */
const HOME_DESTINATION_CODES = ["UDR", "GOI", "IXL", "COK", "JAI"] as const;

const DESTINATION_IMAGES: Record<string, string> = {
  UDR: "/images/destination-udaipur.svg",
  GOI: "/images/destination-goa.svg",
  IXL: "/images/destination-ladakh.svg",
  COK: "/images/destination-kerala.svg",
  JAI: "/images/holidays/heritage.svg",
};

export type HomeDestination = {
  city: City;
  holiday: Holiday;
  packageCount: number;
  minPrice: number;
  image: string;
};

export type HomeStay = {
  hotel: Hotel;
  cityName: string;
};

export type HomeHoliday = {
  holiday: Holiday;
  cityName: string;
};

export type HomeCounts = {
  cities: number;
  hotels: number;
  holidays: number;
  cars: number;
  offers: number;
};

export type HomePageData = {
  destinations: HomeDestination[];
  stays: HomeStay[];
  holidays: HomeHoliday[];
  offers: Offer[];
  counts: HomeCounts;
};

async function getHomeDestinations(): Promise<HomeDestination[]> {
  const [cities, holidays, stats] = await Promise.all([
    getHolidayDestinations(),
    getHolidays(),
    getHolidayCityStats(),
  ]);
  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const holidaysByCode = new Map<string, Holiday[]>();

  for (const holiday of holidays) {
    const list = holidaysByCode.get(holiday.city_code) ?? [];
    list.push(holiday);
    holidaysByCode.set(holiday.city_code, list);
  }

  const destinations: HomeDestination[] = [];

  for (const code of HOME_DESTINATION_CODES) {
    const city = cityByCode.get(code);
    const cityHolidays = holidaysByCode.get(code);

    if (!city || !cityHolidays || cityHolidays.length === 0) continue;

    const holiday = [...cityHolidays].sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        b.rating - a.rating ||
        a.price_per_person - b.price_per_person,
    )[0];
    const stat = stats.get(code);

    destinations.push({
      city,
      holiday,
      packageCount: stat?.count ?? cityHolidays.length,
      minPrice: stat?.minPrice ?? holiday.price_per_person,
      image: DESTINATION_IMAGES[code] ?? holiday.image,
    });
  }

  return destinations;
}

async function getHomeStays(limit: number): Promise<HomeStay[]> {
  const [hotels, cities] = await Promise.all([getFeaturedHotels(limit), getCities()]);
  const cityNames = new Map(cities.map((city) => [city.code, city.name]));

  return hotels.map((hotel) => ({
    hotel,
    cityName: cityNames.get(hotel.city_code) ?? hotel.city_code,
  }));
}

async function getHomeHolidays(limit: number): Promise<HomeHoliday[]> {
  const [holidays, cities] = await Promise.all([getHolidays(), getCities()]);
  const cityNames = new Map(cities.map((city) => [city.code, city.name]));

  return holidays
    .filter((holiday) => holiday.featured)
    .sort((a, b) => b.rating - a.rating || a.price_per_person - b.price_per_person)
    .slice(0, limit)
    .map((holiday) => ({
      holiday,
      cityName: cityNames.get(holiday.city_code) ?? holiday.city_code,
    }));
}

/**
 * Keep one offer from each travel line in the home carousel, then fill the
 * remaining slots with the next best offers. This avoids a first screen that
 * is all flights simply because the CSV is ordered that way.
 */
function pickHomeOffers(offers: Offer[], limit: number): Offer[] {
  const sorted = [...offers].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      a.valid_until.localeCompare(b.valid_until) ||
      a.title.localeCompare(b.title),
  );
  const picked: Offer[] = [];
  const seenCategories = new Set<string>();

  for (const offer of sorted) {
    if (seenCategories.has(offer.category)) continue;
    picked.push(offer);
    seenCategories.add(offer.category);
    if (picked.length >= limit) break;
  }

  for (const offer of sorted) {
    if (picked.length >= limit) break;
    if (picked.some((entry) => entry.id === offer.id)) continue;
    picked.push(offer);
  }

  return picked;
}

export async function getHomePageData(): Promise<HomePageData> {
  const [destinations, stays, holidays, cities, hotels, allHolidays, allOffers, cars] =
    await Promise.all([
      getHomeDestinations(),
      getHomeStays(4),
      getHomeHolidays(4),
      getCities(),
      getHotels(),
      getHolidays(),
      getOffers(),
      getCars(),
    ]);

  return {
    destinations,
    stays,
    holidays,
    offers: pickHomeOffers(allOffers, 6),
    counts: {
      cities: cities.length,
      hotels: hotels.length,
      holidays: allHolidays.length,
      cars: cars.length,
      offers: allOffers.length,
    },
  };
}
