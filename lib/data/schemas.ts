import { z } from "zod";
import {
  cabinValues,
  hotelSortValues,
  PROPERTY_TYPES,
  flightSortValues,
} from "@/lib/search-options";

const csvBoolean = z.enum(["true", "false"]).transform((value) => value === "true");

const csvList = z.string().transform((value) =>
  value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean),
);

const clockTime = z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM");

export const cabinSchema = z.enum(cabinValues);

export const citySchema = z.object({
  code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1),
  state: z.string().trim().min(1),
  region: z.enum(["North", "South", "East", "West", "Central", "Northeast"]),
  airport: z.string().trim().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  popular: csvBoolean,
  tagline: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const flightSchema = z.object({
  id: z.string().trim().min(1),
  airline: z.string().trim().min(1),
  airline_code: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  flight_number: z.string().trim().min(1),
  from_code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  to_code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  depart_time: clockTime,
  arrive_time: clockTime,
  arrive_day_offset: z.coerce.number().int().min(0).max(1),
  duration_minutes: z.coerce.number().int().positive(),
  stops: z.coerce.number().int().min(0).max(2),
  via: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value.toUpperCase())),
  aircraft: z.string().trim().min(1),
  fare_economy: z.coerce.number().int().positive(),
  fare_premium: z.coerce.number().int().positive(),
  fare_business: z.coerce.number().int().positive(),
  refundable: csvBoolean,
  fare_brand: z.enum(["Saver", "Flex"]),
  baggage_checkin: z.coerce.number().int().positive(),
  baggage_cabin: z.coerce.number().int().positive(),
  meal_included: csvBoolean,
  on_time: z.coerce.number().int().min(0).max(100),
  seats_left: z.coerce.number().int().nonnegative(),
  carbon_kg: z.coerce.number().int().nonnegative(),
});

export const hotelSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  city_code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  area: z.string().trim().min(1),
  property_type: z.enum(PROPERTY_TYPES),
  star_rating: z.coerce.number().int().min(1).max(5),
  guest_rating: z.coerce.number().min(0).max(10),
  review_count: z.coerce.number().int().nonnegative(),
  price_per_night: z.coerce.number().int().positive(),
  tax_percent: z.coerce.number().int().min(0).max(30),
  image: z.string().trim().min(1),
  amenities: csvList,
  room_type: z.string().trim().min(1),
  breakfast: csvBoolean,
  free_cancellation: csvBoolean,
  check_in: clockTime,
  check_out: clockTime,
  distance_km: z.coerce.number().nonnegative(),
  tagline: z.string().trim().min(1),
  description: z.string().trim().min(1),
  featured: csvBoolean,
});

export const flightSortSchema = z.enum(flightSortValues);
export const hotelSortSchema = z.enum(hotelSortValues);

export type City = z.infer<typeof citySchema>;
export type Flight = z.infer<typeof flightSchema>;
export type Hotel = z.infer<typeof hotelSchema>;
