import { getCities } from "@/lib/data/cities";
import { readCollection } from "@/lib/data/mongo";
import { hotelSchema, type City, type Hotel } from "@/lib/data/schemas";
import { HotelModel } from "@/lib/models";
import { type AmenityFilter, type HotelSort, type PriceBand } from "@/lib/search-options";

export type HotelQuery = {
  city: string | null;
  checkIn: string | null;
  checkOut: string | null;
  rooms: number;
  guests: number;
  sort: HotelSort;
  priceBands: PriceBand[];
  stars: number[];
  minRating: number | null;
  amenities: AmenityFilter[];
  breakfastOnly: boolean;
  cancellationOnly: boolean;
};

export type HotelFacet = {
  value: string;
  label: string;
  count: number;
};

export type HotelFacets = {
  stars: HotelFacet[];
  priceBands: HotelFacet[];
  amenities: HotelFacet[];
  breakfast: number;
  cancellation: number;
  minPrice: number;
  maxPrice: number;
};

export async function getHotels(): Promise<Hotel[]> {
  return readCollection(HotelModel, hotelSchema);
}

export async function getHotelById(id: string): Promise<Hotel | undefined> {
  const hotels = await getHotels();
  return hotels.find((hotel) => hotel.id === id);
}

export function priceBandFor(price: number): PriceBand {
  if (price <= 5000) return "budget";
  if (price <= 9000) return "mid";
  if (price <= 15000) return "premium";
  return "luxury";
}

export async function searchHotels(query: HotelQuery): Promise<Hotel[]> {
  if (!query.city) return [];

  const hotels = await getHotels();
  const results = hotels.filter((hotel) => {
    if (hotel.city_code !== query.city) return false;
    if (
      query.priceBands.length > 0 &&
      !query.priceBands.includes(priceBandFor(hotel.price_per_night))
    ) {
      return false;
    }
    if (query.stars.length > 0 && !query.stars.includes(hotel.star_rating)) return false;
    if (query.minRating !== null && hotel.guest_rating < query.minRating) return false;
    if (
      query.amenities.length > 0 &&
      !query.amenities.every((item) => hotel.amenities.includes(item))
    ) {
      return false;
    }
    if (query.breakfastOnly && !hotel.breakfast) return false;
    if (query.cancellationOnly && !hotel.free_cancellation) return false;
    return true;
  });

  results.sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return a.price_per_night - b.price_per_night;
      case "price-desc":
        return b.price_per_night - a.price_per_night;
      case "rating":
        return b.guest_rating - a.guest_rating || b.review_count - a.review_count;
      case "stars":
        return b.star_rating - a.star_rating || b.guest_rating - a.guest_rating;
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          b.guest_rating - a.guest_rating ||
          a.price_per_night - b.price_per_night
        );
    }
  });

  return results;
}

export function buildHotelFacets(hotels: Hotel[]): HotelFacets {
  const stars = new Map<string, HotelFacet>();
  const priceBands = new Map<string, HotelFacet>();
  const amenities = new Map<string, HotelFacet>();
  let breakfast = 0;
  let cancellation = 0;
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const hotel of hotels) {
    const starValue = String(hotel.star_rating);
    const star = stars.get(starValue) ?? {
      value: starValue,
      label: `${hotel.star_rating}-star`,
      count: 0,
    };
    star.count += 1;
    stars.set(starValue, star);

    const bandValue = priceBandFor(hotel.price_per_night);
    const band = priceBands.get(bandValue) ?? { value: bandValue, label: bandValue, count: 0 };
    band.count += 1;
    priceBands.set(bandValue, band);

    for (const amenity of hotel.amenities) {
      const facet = amenities.get(amenity) ?? { value: amenity, label: amenity, count: 0 };
      facet.count += 1;
      amenities.set(amenity, facet);
    }

    if (hotel.breakfast) breakfast += 1;
    if (hotel.free_cancellation) cancellation += 1;
    minPrice = Math.min(minPrice, hotel.price_per_night);
    maxPrice = Math.max(maxPrice, hotel.price_per_night);
  }

  return {
    stars: [...stars.values()].sort((a, b) => Number(b.value) - Number(a.value)),
    priceBands: [...priceBands.values()],
    amenities: [...amenities.values()].sort((a, b) => b.count - a.count),
    breakfast,
    cancellation,
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
  };
}

export async function getHotelCities(): Promise<City[]> {
  const [cities, hotels] = await Promise.all([getCities(), getHotels()]);
  const codes = new Set(hotels.map((hotel) => hotel.city_code));

  return cities
    .filter((city) => codes.has(city.code))
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
}

export async function getFeaturedHotels(limit = 6): Promise<Hotel[]> {
  const hotels = await getHotels();
  return hotels
    .filter((hotel) => hotel.featured)
    .sort((a, b) => b.guest_rating - a.guest_rating || a.price_per_night - b.price_per_night)
    .slice(0, limit);
}

export async function getHotelsByCity(cityCode: string): Promise<Hotel[]> {
  const hotels = await getHotels();
  return hotels
    .filter((hotel) => hotel.city_code === cityCode)
    .sort((a, b) => b.guest_rating - a.guest_rating);
}
