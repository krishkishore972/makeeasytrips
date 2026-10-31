import { getCities } from "@/lib/data/cities";
import { readCollection } from "@/lib/data/mongo";
import { carSchema, type Car, type City } from "@/lib/data/schemas";
import { CarModel } from "@/lib/models";
import {
  carFuelValues,
  carTransmissionValues,
  carTypeValues,
  type CarBudget,
  type CarFuel,
  type CarMode,
  type CarSeatBand,
  type CarSort,
  type CarTransmission,
  type CarType,
} from "@/lib/search-options";

export type CarQuery = {
  city: string | null;
  start: string;
  end: string;
  hours: number;
  days: number;
  mode: CarMode;
  sort: CarSort;
  types: CarType[];
  transmissions: CarTransmission[];
  fuels: CarFuel[];
  seatBands: CarSeatBand[];
  budgets: CarBudget[];
  minRating: number | null;
  minYear: number | null;
  maxDistance: number | null;
  fastagOnly: boolean;
  deliveryOnly: boolean;
};

export type CarFacet = {
  value: string;
  label: string;
  count: number;
};

export type CarFacets = {
  types: CarFacet[];
  transmissions: CarFacet[];
  fuels: CarFacet[];
  seats: CarFacet[];
  ratings: CarFacet[];
  fastag: number;
  delivery: number;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  maxDistance: number;
};

export async function getCars(): Promise<Car[]> {
  return readCollection(CarModel, carSchema);
}

export async function getCarById(id: string): Promise<Car | undefined> {
  const cars = await getCars();
  return cars.find((car) => car.id === id);
}

export async function searchCars(query: CarQuery): Promise<Car[]> {
  if (!query.city) return [];

  const cars = await getCars();
  const results = cars.filter((car) => {
    if (car.city_code !== query.city) return false;
    if (query.types.length > 0 && !query.types.includes(car.car_type)) return false;
    if (query.transmissions.length > 0 && !query.transmissions.includes(car.transmission)) {
      return false;
    }
    if (query.fuels.length > 0 && !query.fuels.includes(car.fuel)) return false;
    if (query.seatBands.length > 0) {
      const matches = query.seatBands.some((band) =>
        band === "4-5" ? car.seats <= 5 : car.seats >= 6,
      );
      if (!matches) return false;
    }
    if (query.budgets.length > 0) {
      const matches = query.budgets.some((band) => {
        if (band === "under-300") return car.price_per_hour < 300;
        if (band === "300-600") return car.price_per_hour >= 300 && car.price_per_hour <= 600;
        if (band === "600-1000") return car.price_per_hour > 600 && car.price_per_hour <= 1000;
        return car.price_per_hour > 1000;
      });
      if (!matches) return false;
    }
    if (query.minRating !== null && car.rating < query.minRating) return false;
    if (query.minYear !== null && car.year < query.minYear) return false;
    if (query.maxDistance !== null && car.distance_km > query.maxDistance) return false;
    if (query.fastagOnly && !car.fastag) return false;
    if (query.deliveryOnly && !car.home_delivery) return false;
    return true;
  });

  results.sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return a.price_per_hour - b.price_per_hour || b.rating - a.rating;
      case "price-desc":
        return b.price_per_hour - a.price_per_hour || b.rating - a.rating;
      case "rating":
        return b.rating - a.rating || b.review_count - a.review_count;
      case "distance":
        return a.distance_km - b.distance_km || a.price_per_hour - b.price_per_hour;
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          Number(b.guest_favorite) - Number(a.guest_favorite) ||
          b.rating - a.rating ||
          a.price_per_hour - b.price_per_hour
        );
    }
  });

  return results;
}

export function buildCarFacets(cars: Car[]): CarFacets {
  const types = new Map<string, CarFacet>();
  const transmissions = new Map<string, CarFacet>();
  const fuels = new Map<string, CarFacet>();
  const seats = new Map<string, CarFacet>();
  const ratings = new Map<string, CarFacet>();
  let fastag = 0;
  let delivery = 0;
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;
  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = 0;
  let maxDistance = 0;

  for (const car of cars) {
    for (const [map, value] of [
      [types, car.car_type],
      [transmissions, car.transmission],
      [fuels, car.fuel],
    ] as const) {
      const facet = map.get(value) ?? { value, label: value, count: 0 };
      facet.count += 1;
      map.set(value, facet);
    }

    const seatBand = car.seats >= 6 ? "6-7" : "4-5";
    const seat = seats.get(seatBand) ?? {
      value: seatBand,
      label: seatBand === "6-7" ? "6/7 seater" : "4/5 seater",
      count: 0,
    };
    seat.count += 1;
    seats.set(seatBand, seat);

    if (car.rating >= 4.5) {
      const rating = ratings.get("4.5") ?? { value: "4.5", label: "4.5+ rated", count: 0 };
      rating.count += 1;
      ratings.set("4.5", rating);
    }
    if (car.rating >= 4.2) {
      const rating = ratings.get("4.2") ?? { value: "4.2", label: "4.2+ rated", count: 0 };
      rating.count += 1;
      ratings.set("4.2", rating);
    }
    if (car.rating >= 4.0) {
      const rating = ratings.get("4.0") ?? { value: "4.0", label: "4.0+ rated", count: 0 };
      rating.count += 1;
      ratings.set("4.0", rating);
    }

    if (car.fastag) fastag += 1;
    if (car.home_delivery) delivery += 1;
    minPrice = Math.min(minPrice, car.price_per_hour);
    maxPrice = Math.max(maxPrice, car.price_per_hour);
    minYear = Math.min(minYear, car.year);
    maxYear = Math.max(maxYear, car.year);
    maxDistance = Math.max(maxDistance, car.distance_km);
  }

  const byTypeOrder = (a: CarFacet, b: CarFacet) =>
    carTypeValues.indexOf(a.value as CarType) - carTypeValues.indexOf(b.value as CarType);
  const byFuelOrder = (a: CarFacet, b: CarFacet) =>
    carFuelValues.indexOf(a.value as CarFuel) - carFuelValues.indexOf(b.value as CarFuel);
  const byTransmissionOrder = (a: CarFacet, b: CarFacet) =>
    carTransmissionValues.indexOf(a.value as CarTransmission) -
    carTransmissionValues.indexOf(b.value as CarTransmission);

  return {
    types: [...types.values()].sort(byTypeOrder),
    transmissions: [...transmissions.values()].sort(byTransmissionOrder),
    fuels: [...fuels.values()].sort(byFuelOrder),
    seats: [...seats.values()].sort((a, b) => a.value.localeCompare(b.value)),
    ratings: ["4.5", "4.2", "4.0"].flatMap((value) => ratings.get(value) ?? []),
    fastag,
    delivery,
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
    minYear: Number.isFinite(minYear) ? minYear : 0,
    maxYear,
    maxDistance: Math.ceil(maxDistance),
  };
}

export async function getCarCities(): Promise<City[]> {
  const [cities, cars] = await Promise.all([getCities(), getCars()]);
  const codes = new Set(cars.map((car) => car.city_code));

  return cities
    .filter((city) => codes.has(city.code))
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
}

export async function getFeaturedCars(limit = 6): Promise<Car[]> {
  const cars = await getCars();
  return cars
    .filter((car) => car.featured)
    .sort(
      (a, b) =>
        Number(b.guest_favorite) - Number(a.guest_favorite) ||
        b.rating - a.rating ||
        a.price_per_hour - b.price_per_hour,
    )
    .slice(0, limit);
}

export async function getCarsByCity(cityCode: string): Promise<Car[]> {
  const cars = await getCars();
  return cars
    .filter((car) => car.city_code === cityCode)
    .sort((a, b) => b.rating - a.rating || a.price_per_hour - b.price_per_hour);
}

export async function getSimilarCars(car: Car, limit = 3): Promise<Car[]> {
  const cars = await getCars();
  return cars
    .filter((candidate) => candidate.id !== car.id)
    .sort((a, b) => {
      const cityScore =
        Number(b.city_code === car.city_code) - Number(a.city_code === car.city_code);
      const typeScore = Number(b.car_type === car.car_type) - Number(a.car_type === car.car_type);
      return (
        cityScore * 2 + typeScore || b.rating - a.rating || a.price_per_hour - b.price_per_hour
      );
    })
    .slice(0, limit);
}

export type CarCityStats = {
  count: number;
  minPrice: number;
  maxRating: number;
};

export async function getCarCityStats(): Promise<Map<string, CarCityStats>> {
  const cars = await getCars();
  const stats = new Map<string, CarCityStats>();

  for (const car of cars) {
    const existing = stats.get(car.city_code);
    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, car.price_per_hour);
      existing.maxRating = Math.max(existing.maxRating, car.rating);
    } else {
      stats.set(car.city_code, {
        count: 1,
        minPrice: car.price_per_hour,
        maxRating: car.rating,
      });
    }
  }

  return stats;
}
