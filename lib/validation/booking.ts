import { z } from "zod";
import { isValidISODate, isValidISODateTime, rentalHoursBetween } from "@/lib/dates";
import { cabinValues, carAddonValues, carKmPlanValues } from "@/lib/search-options";
import { firstParam } from "@/lib/utils";

export type RawBookingParams = Record<string, string | string[] | undefined>;

export const bookingTypeValues = ["flight", "hotel", "holiday", "car"] as const;
export type BookingType = (typeof bookingTypeValues)[number];

const isoDate = z.string().refine(isValidISODate, "Choose a valid date.");
const isoDateTime = z.string().refine(isValidISODateTime, "Choose a valid date and time.");

const bookingCount = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

const flightBookingSchema = z.object({
  type: z.literal("flight"),
  id: z.string().trim().min(1),
  depart: isoDate,
  pax: bookingCount(1, 9),
  cabin: z.enum(cabinValues),
});

const hotelBookingSchema = z.object({
  type: z.literal("hotel"),
  id: z.string().trim().min(1),
  checkin: isoDate,
  checkout: isoDate,
  rooms: bookingCount(1, 4),
  guests: bookingCount(1, 12),
  plan: z.enum(["saver", "flex"]),
});

const holidayBookingSchema = z.object({
  type: z.literal("holiday"),
  slug: z.string().trim().min(1),
  depart: isoDate,
  travellers: bookingCount(1, 9),
});

const carBookingSchema = z.object({
  type: z.literal("car"),
  id: z.string().trim().min(1),
  start: isoDateTime,
  end: isoDateTime,
  plan: z.enum(carKmPlanValues),
  delivery: z
    .enum(["0", "1"])
    .optional()
    .transform((value) => value === "1"),
  addons: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter((item): item is (typeof carAddonValues)[number] =>
              carAddonValues.includes(item as (typeof carAddonValues)[number]),
            )
        : [],
    ),
});

/**
 * A booking is a linkable selection, not a stored record. The discriminated
 * union keeps flight, stay, holiday, and car params from leaking into each other.
 */
export const bookingSelectionSchema = z
  .discriminatedUnion("type", [
    flightBookingSchema,
    hotelBookingSchema,
    holidayBookingSchema,
    carBookingSchema,
  ])
  .superRefine((value, ctx) => {
    if (value.type === "hotel" && value.checkout <= value.checkin) {
      ctx.addIssue({
        code: "custom",
        path: ["checkout"],
        message: "Check-out needs to be after check-in.",
      });
    }

    if (value.type === "car") {
      const hours = rentalHoursBetween(value.start, value.end);

      if (hours === null) {
        ctx.addIssue({
          code: "custom",
          path: ["end"],
          message: "Drop-off needs to be after pick-up.",
        });
      } else if (hours > 30 * 24) {
        ctx.addIssue({
          code: "custom",
          path: ["end"],
          message: "This demo caps a single rental at 30 days.",
        });
      }
    }
  });

export type BookingSelection = z.infer<typeof bookingSelectionSchema>;

export type ParsedBooking = {
  selection: BookingSelection | null;
  error: string | null;
};

function raw(params: RawBookingParams, key: string) {
  return firstParam(params[key])?.trim() || undefined;
}

function isBookingType(value: string | undefined): value is BookingType {
  return Boolean(value && bookingTypeValues.includes(value as BookingType));
}

function friendlyError(error: z.ZodError, type: BookingType): string {
  const field = error.issues[0]?.path[0];

  if (type === "flight") {
    switch (field) {
      case "id":
        return "That flight is missing from this link. Open the flight again and choose a fare.";
      case "depart":
        return "Choose a valid travel date before reviewing this flight.";
      case "pax":
        return "Choose between 1 and 9 travellers for this flight.";
      case "cabin":
        return "Choose a valid cabin before reviewing this flight.";
      default:
        break;
    }
  }

  if (type === "hotel") {
    switch (field) {
      case "id":
        return "That stay is missing from this link. Open the stay again and choose a rate.";
      case "checkin":
        return "Choose a valid check-in date for this stay.";
      case "checkout":
        return "Check-out needs to be after check-in.";
      case "rooms":
        return "Choose between 1 and 4 rooms for this stay.";
      case "guests":
        return "Choose between 1 and 12 guests for this stay.";
      case "plan":
        return "Choose a rate plan before reviewing this stay.";
      default:
        break;
    }
  }

  if (type === "holiday") {
    switch (field) {
      case "slug":
        return "That package is missing from this link. Open the holiday again and choose it.";
      case "depart":
        return "Choose a valid departure date for this package.";
      case "travellers":
        return "Choose between 1 and 9 travellers for this package.";
      default:
        break;
    }
  }

  if (type === "car") {
    switch (field) {
      case "id":
        return "That car is missing from this link. Open the listing again and choose it.";
      case "start":
        return "Choose a valid pick-up date and time for this car.";
      case "end":
        return "Drop-off needs to be after pick-up, within 30 days.";
      case "plan":
        return "Choose a kilometre plan before reviewing this car.";
      default:
        break;
    }
  }

  return "That booking link is incomplete. Open the trip you were viewing and choose it again.";
}

/**
 * Parse the booking hand-off params without throwing. The review and
 * confirmation pages render a friendly recovery state instead of a 404 when a
 * link is incomplete.
 */
export function parseBookingParams(params: RawBookingParams): ParsedBooking {
  const type = raw(params, "type");

  if (!type) {
    return {
      selection: null,
      error: "Choose a stay, holiday, or car before opening the review step.",
    };
  }

  if (!isBookingType(type)) {
    return {
      selection: null,
      error: "That booking type is not part of this demo. Choose a stay, holiday, or car.",
    };
  }

  const result = bookingSelectionSchema.safeParse({
    type,
    id: raw(params, "id"),
    slug: raw(params, "slug"),
    depart: raw(params, "depart"),
    pax: raw(params, "pax"),
    cabin: raw(params, "cabin"),
    checkin: raw(params, "checkin"),
    checkout: raw(params, "checkout"),
    rooms: raw(params, "rooms"),
    guests: raw(params, "guests"),
    plan: raw(params, "plan"),
    travellers: raw(params, "travellers"),
    start: raw(params, "start"),
    end: raw(params, "end"),
    delivery: raw(params, "delivery"),
    addons: raw(params, "addons"),
  });

  if (result.success) {
    return { selection: result.data, error: null };
  }

  return { selection: null, error: friendlyError(result.error, type) };
}
