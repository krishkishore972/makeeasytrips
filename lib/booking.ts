import {
  addDaysISO,
  formatDateLong,
  formatDateTimeLong,
  formatDuration,
  formatGuestLabel,
  formatNightLabel,
  formatRentalDuration,
  nightsBetween,
  rentalDaysFor,
  rentalHoursBetween,
} from "@/lib/dates";
import { getCarById } from "@/lib/data/cars";
import { getCity } from "@/lib/data/cities";
import { fareFor, getFlightById } from "@/lib/data/flights";
import { getHolidayBySlug } from "@/lib/data/holidays";
import { getHotelById } from "@/lib/data/hotels";
import {
  carRentalBreakdown,
  flightFareBreakdown,
  holidayPriceBreakdown,
  hotelStayBreakdown,
  type FareBreakdown,
} from "@/lib/pricing";
import {
  AMENITY_LABELS,
  CABIN_OPTIONS,
  CAR_ADDON_OPTIONS,
  CAR_KM_PLAN_OPTIONS,
  HOLIDAY_THEME_LABELS,
} from "@/lib/search-options";
import { formatCurrency, toQueryString } from "@/lib/utils";
import type { BookingSelection, BookingType } from "@/lib/validation/booking";

export type BookingDetail = {
  label: string;
  value: string;
};

export type BookingBreakdownRow = {
  label: string;
  value: string;
};

export type BookingNextStep = {
  title: string;
  detail: string;
};

export type BookingSummary = {
  type: BookingType;
  typeLabel: string;
  reference: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  details: BookingDetail[];
  inclusions: string[];
  breakdown: FareBreakdown;
  breakdownRows: BookingBreakdownRow[];
  totalLabel: string;
  priceNote: string;
  productHref: string;
  productLabel: string;
  nextSteps: BookingNextStep[];
};

export type BookingResolution = {
  summary: BookingSummary | null;
  error: string | null;
};

const typeLabels: Record<BookingType, string> = {
  flight: "Flight",
  hotel: "Stay",
  holiday: "Holiday",
  car: "Car rental",
};

const typePrefixes: Record<BookingType, string> = {
  flight: "FL",
  hotel: "ST",
  holiday: "HL",
  car: "CR",
};

const productLabels: Record<BookingType, string> = {
  flight: "Back to flight details",
  hotel: "Back to stay details",
  holiday: "Back to package details",
  car: "Back to car details",
};

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function hash(value: string) {
  let result = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }

  return (result >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
}

/** URL params for a selection. Used by the review form and shareable links. */
export function bookingParams(selection: BookingSelection): Record<string, string> {
  switch (selection.type) {
    case "flight":
      return {
        type: "flight",
        id: selection.id,
        depart: selection.depart,
        pax: String(selection.pax),
        cabin: selection.cabin,
      };
    case "hotel":
      return {
        type: "hotel",
        id: selection.id,
        checkin: selection.checkin,
        checkout: selection.checkout,
        rooms: String(selection.rooms),
        guests: String(selection.guests),
        plan: selection.plan,
      };
    case "holiday":
      return {
        type: "holiday",
        slug: selection.slug,
        depart: selection.depart,
        travellers: String(selection.travellers),
      };
    case "car":
      return {
        type: "car",
        id: selection.id,
        start: selection.start,
        end: selection.end,
        plan: selection.plan,
        delivery: selection.delivery ? "1" : "0",
        addons: selection.addons.join(","),
      };
  }
}

/**
 * A stable, human-readable reference derived from the selection. Nothing is
 * persisted; the same URL always produces the same reference.
 */
export function bookingReference(selection: BookingSelection) {
  const canonical = Object.entries(bookingParams(selection))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `TN-${typePrefixes[selection.type]}-${hash(canonical)}`;
}

export function bookingReviewHref(selection: BookingSelection) {
  return `/booking/review${toQueryString(bookingParams(selection))}`;
}

export function bookingConfirmationHref(selection: BookingSelection) {
  return `/booking/confirmation${toQueryString({
    ...bookingParams(selection),
    confirmed: "1",
  })}`;
}

export async function resolveBooking(selection: BookingSelection): Promise<BookingResolution> {
  switch (selection.type) {
    case "flight":
      return resolveFlightBooking(selection);
    case "hotel":
      return resolveHotelBooking(selection);
    case "holiday":
      return resolveHolidayBooking(selection);
    case "car":
      return resolveCarBooking(selection);
  }
}

async function resolveFlightBooking(
  selection: Extract<BookingSelection, { type: "flight" }>,
): Promise<BookingResolution> {
  const flight = await getFlightById(selection.id);

  if (!flight) {
    return {
      summary: null,
      error: "That flight is no longer in the demo catalogue. Choose another fare to continue.",
    };
  }

  const [origin, destination] = await Promise.all([
    getCity(flight.from_code),
    getCity(flight.to_code),
  ]);

  const cabinLabel =
    CABIN_OPTIONS.find((option) => option.value === selection.cabin)?.label ?? "Economy";
  const fare = fareFor(flight, selection.cabin);
  const breakdown = flightFareBreakdown(fare, selection.pax);
  const arriveDate = addDaysISO(selection.depart, flight.arrive_day_offset);
  const stopsLabel =
    flight.stops === 0
      ? "Nonstop"
      : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}${flight.via ? ` via ${flight.via}` : ""}`;

  return {
    summary: {
      type: "flight",
      typeLabel: typeLabels.flight,
      reference: bookingReference(selection),
      title: `${origin?.name ?? flight.from_code} → ${destination?.name ?? flight.to_code}`,
      subtitle: `${flight.airline} ${flight.flight_number} · ${formatDateLong(selection.depart)}`,
      image: "/images/booking/flight.svg",
      imageAlt: "An abstract illustration of a plane crossing a teal horizon.",
      details: [
        {
          label: "Route",
          value: `${origin?.name ?? flight.from_code} (${flight.from_code}) → ${
            destination?.name ?? flight.to_code
          } (${flight.to_code})`,
        },
        { label: "Travel date", value: formatDateLong(selection.depart) },
        { label: "Departure", value: `${flight.depart_time} · ${flight.from_code}` },
        {
          label: "Arrival",
          value: `${flight.arrive_time}${flight.arrive_day_offset ? " (+1 day)" : ""} · ${
            flight.to_code
          }`,
        },
        { label: "Cabin", value: cabinLabel },
        {
          label: "Travellers",
          value: `${selection.pax} ${plural(selection.pax, "traveller")}`,
        },
        {
          label: "Journey",
          value: `${formatDuration(flight.duration_minutes)} · ${stopsLabel}`,
        },
        {
          label: "Baggage",
          value: `${flight.baggage_checkin} kg check-in · ${flight.baggage_cabin} kg cabin`,
        },
      ],
      inclusions: [
        `${flight.baggage_checkin} kg check-in baggage`,
        `${flight.baggage_cabin} kg cabin baggage`,
        flight.meal_included ? "Meal included on board" : "Meals available to buy on board",
        flight.refundable ? "Refundable under the demo fare rules" : "Non-refundable demo fare",
        `${flight.fare_brand} fare with a standard seat assigned at check-in`,
      ],
      breakdown,
      breakdownRows: [
        {
          label: `Base fare × ${selection.pax} ${plural(selection.pax, "traveller")}`,
          value: formatCurrency(breakdown.base),
        },
        { label: "Taxes and fees", value: formatCurrency(breakdown.taxes) },
      ],
      totalLabel: "Trip total",
      priceNote: `Includes demo taxes and fees for ${selection.pax} ${plural(
        selection.pax,
        "traveller",
      )}. No payment is taken.`,
      productHref: `/flights/${flight.id}${toQueryString({
        from: flight.from_code,
        to: flight.to_code,
        depart: selection.depart,
        pax: selection.pax,
        cabin: selection.cabin,
      })}`,
      productLabel: productLabels.flight,
      nextSteps: [
        {
          title: "Arrive with time to spare",
          detail: `Check in at ${origin?.airport ?? flight.from_code} at least two hours before the ${flight.depart_time} departure.`,
        },
        {
          title: "Keep a photo ID handy",
          detail:
            "This demo does not collect passenger names, so no traveller details are attached to the reference.",
        },
        {
          title: "Use the reference for this demo only",
          detail: `The arrival is scheduled for ${formatDateLong(
            arriveDate,
          )}. The reference is not a real airline record locator.`,
        },
      ],
    },
    error: null,
  };
}

async function resolveHotelBooking(
  selection: Extract<BookingSelection, { type: "hotel" }>,
): Promise<BookingResolution> {
  const hotel = await getHotelById(selection.id);

  if (!hotel) {
    return {
      summary: null,
      error: "That stay is no longer in the demo catalogue. Choose another rate to continue.",
    };
  }

  const city = await getCity(hotel.city_code);
  const nights = nightsBetween(selection.checkin, selection.checkout);
  const isFlex = selection.plan === "flex";
  const perNight = hotel.price_per_night + (isFlex ? 900 : 0);
  const planName = isFlex ? `${hotel.room_type} · Flex` : hotel.room_type;
  const breakfast = isFlex || hotel.breakfast;
  const cancellation = isFlex || hotel.free_cancellation;
  const breakdown = hotelStayBreakdown(perNight, nights, selection.rooms, hotel.tax_percent);
  const visibleAmenities = hotel.amenities
    .filter((amenity) => amenity !== "breakfast")
    .slice(0, 3)
    .map((amenity) => AMENITY_LABELS[amenity] ?? amenity);

  return {
    summary: {
      type: "hotel",
      typeLabel: typeLabels.hotel,
      reference: bookingReference(selection),
      title: hotel.name,
      subtitle: `${hotel.property_type} · ${hotel.area}, ${city?.name ?? hotel.city_code}`,
      image: hotel.image,
      imageAlt: `An abstract illustration of ${hotel.name} in ${hotel.area}.`,
      details: [
        { label: "Stay", value: `${hotel.name} · ${hotel.area}` },
        {
          label: "Check-in",
          value: `${formatDateLong(selection.checkin)} · from ${hotel.check_in}`,
        },
        {
          label: "Check-out",
          value: `${formatDateLong(selection.checkout)} · by ${hotel.check_out}`,
        },
        { label: "Nights", value: formatNightLabel(nights) },
        {
          label: "Rooms and guests",
          value: formatGuestLabel(selection.rooms, selection.guests),
        },
        { label: "Rate plan", value: planName },
        { label: "Breakfast", value: breakfast ? "Included" : "Room only" },
        {
          label: "Cancellation",
          value: cancellation ? "Free until 24 hours before" : "Non-refundable demo rate",
        },
      ],
      inclusions: [
        breakfast ? "Breakfast included" : "Room only",
        cancellation
          ? "Free cancellation until 24 hours before check-in"
          : "Non-refundable demo rate",
        ...(isFlex ? ["Late checkout request until 2 pm"] : []),
        ...visibleAmenities,
      ],
      breakdown,
      breakdownRows: [
        {
          label: `${formatNightLabel(nights)} × ${selection.rooms} ${plural(
            selection.rooms,
            "room",
          )}`,
          value: formatCurrency(breakdown.base),
        },
        {
          label: `Taxes (${hotel.tax_percent}%)`,
          value: formatCurrency(breakdown.taxes),
        },
      ],
      totalLabel: "Stay total",
      priceNote: `Includes ${hotel.tax_percent}% demo taxes on the room subtotal. No room is held or charged.`,
      productHref: `/hotels/${hotel.id}${toQueryString({
        checkin: selection.checkin,
        checkout: selection.checkout,
        rooms: selection.rooms,
        guests: selection.guests,
      })}`,
      productLabel: productLabels.hotel,
      nextSteps: [
        {
          title: `Check in from ${hotel.check_in}`,
          detail: `${hotel.name} is in ${hotel.area}, ${city?.name ?? hotel.city_code}. Check-out is by ${hotel.check_out}.`,
        },
        {
          title: "Bring a photo ID",
          detail:
            "This demo does not collect guest names, so no personal details are attached to the reference.",
        },
        {
          title: "Nothing is reserved",
          detail:
            "The reference is generated from this selection. It is not a real hotel confirmation or a room hold.",
        },
      ],
    },
    error: null,
  };
}

async function resolveHolidayBooking(
  selection: Extract<BookingSelection, { type: "holiday" }>,
): Promise<BookingResolution> {
  const holiday = await getHolidayBySlug(selection.slug);

  if (!holiday) {
    return {
      summary: null,
      error: "That package is no longer in the demo catalogue. Choose another holiday to continue.",
    };
  }

  if (!holiday.departure_dates.includes(selection.depart)) {
    return {
      summary: null,
      error:
        "That departure date is not available for this package. Pick another date on the package page.",
    };
  }

  const city = await getCity(holiday.city_code);
  const breakdown = holidayPriceBreakdown(holiday.price_per_person, selection.travellers);
  const themeLabels = holiday.themes
    .map((theme) => HOLIDAY_THEME_LABELS[theme] ?? theme)
    .join(", ");

  return {
    summary: {
      type: "holiday",
      typeLabel: typeLabels.holiday,
      reference: bookingReference(selection),
      title: holiday.title,
      subtitle: `${city?.name ?? holiday.country} · ${holiday.days} days / ${holiday.nights} nights`,
      image: holiday.image,
      imageAlt: `An abstract illustration of ${holiday.title}.`,
      details: [
        { label: "Destination", value: city?.name ?? holiday.country },
        { label: "Departure", value: formatDateLong(selection.depart) },
        {
          label: "Duration",
          value: `${holiday.days} days · ${holiday.nights} nights`,
        },
        {
          label: "Travellers",
          value: `${selection.travellers} ${plural(selection.travellers, "traveller")}`,
        },
        { label: "Itinerary", value: `${holiday.itinerary.length} planned days` },
        { label: "Themes", value: themeLabels },
        { label: "Price basis", value: "Per person on twin sharing" },
      ],
      inclusions: holiday.inclusions.slice(0, 6),
      breakdown,
      breakdownRows: [
        {
          label: `${formatCurrency(holiday.price_per_person)} × ${selection.travellers} ${plural(
            selection.travellers,
            "traveller",
          )}`,
          value: formatCurrency(breakdown.base),
        },
        { label: "Taxes and fees (5%)", value: formatCurrency(breakdown.taxes) },
      ],
      totalLabel: "Package total",
      priceNote:
        "Includes 5% demo taxes and fees. Flights are not included unless the package inclusions say so.",
      productHref: `/holidays/${holiday.slug}${toQueryString({
        depart: selection.depart,
        travellers: selection.travellers,
      })}`,
      productLabel: productLabels.holiday,
      nextSteps: [
        {
          title: "A local host is your point of contact",
          detail:
            "The package assumes you arrive on day one and leave on the final day. Airport transfers are listed in the inclusions.",
        },
        {
          title: "Check what is not included",
          detail:
            "Flights, lunches, travel insurance, and personal shopping are excluded unless the package page says otherwise.",
        },
        {
          title: "Keep the demo reference",
          detail:
            "It is generated from this selection and is not a real tour operator booking or a payment receipt.",
        },
      ],
    },
    error: null,
  };
}

async function resolveCarBooking(
  selection: Extract<BookingSelection, { type: "car" }>,
): Promise<BookingResolution> {
  const car = await getCarById(selection.id);

  if (!car) {
    return {
      summary: null,
      error: "That car is no longer in the demo fleet. Choose another car to continue.",
    };
  }

  const hours = rentalHoursBetween(selection.start, selection.end);

  if (hours === null) {
    return {
      summary: null,
      error: "Drop-off needs to be after pick-up. Adjust the times and try again.",
    };
  }

  if (hours > 30 * 24) {
    return {
      summary: null,
      error: "This demo caps a single rental at 30 days. Choose a shorter window.",
    };
  }

  const city = await getCity(car.city_code);
  const days = rentalDaysFor(hours);
  const kmPlan = CAR_KM_PLAN_OPTIONS.find((option) => option.value === selection.plan);
  const addons = CAR_ADDON_OPTIONS.filter((option) => selection.addons.includes(option.value));
  const delivery = selection.delivery && car.home_delivery;
  const breakdown = carRentalBreakdown(car.price_per_hour, {
    days,
    kmPlanExtraPerDay: kmPlan?.extraPerDay ?? 0,
    delivery,
    deliveryFee: car.delivery_fee,
    addons,
    deposit: car.deposit,
  });

  const carName = `${car.brand} ${car.model} ${car.variant}`;
  const breakdownRows: BookingBreakdownRow[] = [
    {
      label: `${formatCurrency(breakdown.perDay)} × ${days} ${plural(days, "day")}`,
      value: formatCurrency(breakdown.base),
    },
  ];

  if (breakdown.kmFee > 0) {
    breakdownRows.push({
      label: `${kmPlan?.label ?? "Unlimited kilometres"} × ${days} ${plural(days, "day")}`,
      value: formatCurrency(breakdown.kmFee),
    });
  }

  if (breakdown.deliveryFee > 0) {
    breakdownRows.push({
      label: "Home delivery",
      value: formatCurrency(breakdown.deliveryFee),
    });
  }

  if (breakdown.addonFee > 0) {
    breakdownRows.push({
      label: addons.map((addon) => addon.label).join(", "),
      value: formatCurrency(breakdown.addonFee),
    });
  }

  breakdownRows.push({ label: "GST (18%)", value: formatCurrency(breakdown.taxes) });

  return {
    summary: {
      type: "car",
      typeLabel: typeLabels.car,
      reference: bookingReference(selection),
      title: carName,
      subtitle: `${car.year} · ${car.transmission} · ${car.fuel} · ${city?.name ?? car.city_code}`,
      image: car.image,
      imageAlt: `An abstract illustration of the ${car.brand} ${car.model}.`,
      details: [
        { label: "Car", value: `${carName} · ${car.year}` },
        { label: "Pick-up", value: formatDateTimeLong(selection.start) },
        { label: "Drop-off", value: formatDateTimeLong(selection.end) },
        { label: "Duration", value: formatRentalDuration(hours) },
        {
          label: "Kilometre plan",
          value: kmPlan ? `${kmPlan.label} · ${kmPlan.detail}` : `${car.km_limit_per_day} km/day`,
        },
        {
          label: "Handover",
          value: delivery
            ? `Home delivery · ${formatCurrency(car.delivery_fee)}`
            : "Pick-up from the host",
        },
        { label: "Host", value: `${car.host_name} · ${car.host_type} host` },
        {
          label: "Refundable deposit",
          value: `${formatCurrency(car.deposit)} · not charged in this demo`,
        },
      ],
      inclusions: [
        `${car.km_limit_per_day} km included every day`,
        kmPlan?.value === "unlimited" ? "Unlimited kilometres in this demo" : "Extra km at ₹12/km",
        car.fastag ? "Active FASTag fitted" : "Bring your own FASTag",
        delivery ? "Delivered to your address" : "Pick-up from the host's location",
        `${car.transmission} transmission · ${car.fuel} · ${car.seats} seats`,
        ...addons.map((addon) => addon.label),
      ],
      breakdown,
      breakdownRows,
      totalLabel: "Rental total",
      priceNote: `Includes 18% GST. The ${formatCurrency(
        car.deposit,
      )} refundable deposit is shown separately and never charged. No car is held.`,
      productHref: `/rent-a-car/${car.id}${toQueryString({
        start: selection.start,
        end: selection.end,
      })}`,
      productLabel: productLabels.car,
      nextSteps: [
        {
          title: `Pick up in ${city?.name ?? car.city_code}`,
          detail: `${car.host_name} hosts this ${car.model}. The listed handover point is ${car.distance_km} km from the city centre.`,
        },
        {
          title: "Bring a valid driving licence",
          detail:
            "This demo does not collect licence details or identity documents. Nothing is verified and nothing is stored.",
        },
        {
          title: "Return with the same fuel level",
          detail: `Fuel, tolls, parking, and fines are not included. The ${formatCurrency(
            car.deposit,
          )} deposit is illustrative and refundable under the demo rules.`,
        },
      ],
    },
    error: null,
  };
}
