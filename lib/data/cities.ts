import { readCsvOnce } from "@/lib/data/csv";
import { citySchema, type City } from "@/lib/data/schemas";

export function getCities(): Promise<City[]> {
  return readCsvOnce("cities.csv", citySchema);
}

export async function getCityMap(): Promise<Map<string, City>> {
  const cities = await getCities();
  return new Map(cities.map((city) => [city.code, city]));
}

export async function getCity(code: string | undefined): Promise<City | undefined> {
  if (!code) return undefined;
  const cities = await getCities();
  return cities.find((city) => city.code === code.toUpperCase());
}
