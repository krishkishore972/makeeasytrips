import { z } from "zod";
import {
  cabinValues,
  carFuelValues,
  carSortValues,
  carTransmissionValues,
  carTypeValues,
  holidaySortValues,
  holidayThemeValues,
  hotelSortValues,
  offerIconValues,
  offerServiceValues,
  offerToneValues,
  PROPERTY_TYPES,
  flightSortValues,
} from "@/lib/search-options";

/**
 * Seed fixtures are typed JSON, while the original CSV export stored every
 * cell as a string. These helpers accept both so the same schema validates
 * fixtures, Mongo documents, and legacy CSV rows.
 */
const booleanish = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((value) => value === "true"),
]);

const csvList = z.string().transform((value) =>
  value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean),
);

const stringList = z.union([z.array(z.string().trim().min(1)), csvList]);

/** Parse either a JSON array or a string cell that holds one. */
function jsonArray<T>(itemSchema: z.ZodType<T>) {
  return z.union([
    z.array(itemSchema),
    z.string().transform((value, ctx): T[] => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "Expected valid JSON" });
        return z.NEVER;
      }

      const result = z.array(itemSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: "custom", message: "JSON array has the wrong shape" });
        return z.NEVER;
      }

      return result.data;
    }),
  ]);
}

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
  popular: booleanish,
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
    .nullable()
    .transform((value) => (value === null || value === "" ? null : value.toUpperCase())),
  aircraft: z.string().trim().min(1),
  fare_economy: z.coerce.number().int().positive(),
  fare_premium: z.coerce.number().int().positive(),
  fare_business: z.coerce.number().int().positive(),
  refundable: booleanish,
  fare_brand: z.enum(["Saver", "Flex"]),
  baggage_checkin: z.coerce.number().int().positive(),
  baggage_cabin: z.coerce.number().int().positive(),
  meal_included: booleanish,
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
  amenities: stringList,
  room_type: z.string().trim().min(1),
  breakfast: booleanish,
  free_cancellation: booleanish,
  check_in: clockTime,
  check_out: clockTime,
  distance_km: z.coerce.number().nonnegative(),
  tagline: z.string().trim().min(1),
  description: z.string().trim().min(1),
  featured: booleanish,
});

export const flightSortSchema = z.enum(flightSortValues);
export const hotelSortSchema = z.enum(hotelSortValues);
export const carSortSchema = z.enum(carSortValues);

export const carSchema = z.object({
  id: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  variant: z.string().trim().min(1),
  year: z.coerce.number().int().min(2015).max(2030),
  city_code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  car_type: z.enum(carTypeValues),
  transmission: z.enum(carTransmissionValues),
  fuel: z.enum(carFuelValues),
  seats: z.coerce.number().int().min(2).max(9),
  price_per_hour: z.coerce.number().int().positive(),
  km_limit_per_day: z.coerce.number().int().positive(),
  rating: z.coerce.number().min(0).max(5),
  review_count: z.coerce.number().int().nonnegative(),
  distance_km: z.coerce.number().nonnegative(),
  host_name: z.string().trim().min(1),
  host_type: z.enum(["Professional", "Individual"]),
  fastag: booleanish,
  home_delivery: booleanish,
  delivery_fee: z.coerce.number().int().nonnegative(),
  deposit: z.coerce.number().int().nonnegative(),
  image: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  description: z.string().trim().min(1),
  featured: booleanish,
  guest_favorite: booleanish,
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const holidayDaySchema = z.object({
  day: z.coerce.number().int().positive(),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
});

export const holidaySchema = z.object({
  id: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Expected a lowercase slug"),
  title: z.string().trim().min(1),
  city_code: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  country: z.string().trim().min(1),
  days: z.coerce.number().int().min(2).max(15),
  nights: z.coerce.number().int().min(1).max(14),
  price_per_person: z.coerce.number().int().positive(),
  rating: z.coerce.number().min(0).max(5),
  review_count: z.coerce.number().int().nonnegative(),
  image: z.string().trim().min(1),
  gallery: jsonArray(z.string().trim().min(1)),
  themes: stringList.pipe(z.array(z.enum(holidayThemeValues))),
  summary: z.string().trim().min(1),
  highlights: jsonArray(z.string().trim().min(1)),
  inclusions: jsonArray(z.string().trim().min(1)),
  exclusions: jsonArray(z.string().trim().min(1)),
  itinerary: jsonArray(holidayDaySchema),
  departure_dates: jsonArray(isoDate),
  featured: booleanish,
});

export const offerSchema = z.object({
  id: z.string().trim().min(1),
  category: z.enum(offerServiceValues),
  eyebrow: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{4,16}$/, "Expected an uppercase code"),
  discount_label: z.string().trim().min(1),
  icon: z.enum(offerIconValues),
  tone: z.enum(offerToneValues),
  cta_label: z.string().trim().min(1),
  cta_href: z.string().trim().min(1),
  valid_until: isoDate,
  terms: z.string().trim().min(1),
  featured: booleanish,
});

export const holidaySortSchema = z.enum(holidaySortValues);

export type City = z.infer<typeof citySchema>;
export type Flight = z.infer<typeof flightSchema>;
export type Hotel = z.infer<typeof hotelSchema>;
export type Car = z.infer<typeof carSchema>;
export type Holiday = z.infer<typeof holidaySchema>;
export type HolidayDay = z.infer<typeof holidayDaySchema>;
export type Offer = z.infer<typeof offerSchema>;
