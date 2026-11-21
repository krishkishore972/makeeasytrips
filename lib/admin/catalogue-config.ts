import type { UploadFolder } from "@/lib/admin/uploads";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-options";
import {
  AMENITY_LABELS,
  CAR_TYPE_OPTIONS,
  HOLIDAY_THEME_OPTIONS,
  PROPERTY_TYPES,
  carFuelValues,
  carTransmissionValues,
  offerIconValues,
  offerServiceValues,
  offerToneValues,
} from "@/lib/search-options";

export const CATALOGUE_RESOURCES = ["hotels", "holidays", "cars", "offers", "events"] as const;
export type CatalogueResource = (typeof CATALOGUE_RESOURCES)[number];

export function isCatalogueResource(value: unknown): value is CatalogueResource {
  return typeof value === "string" && (CATALOGUE_RESOURCES as readonly string[]).includes(value);
}

export type CatalogueMeta = {
  label: string;
  singular: string;
  description: string;
  uploadFolder: UploadFolder;
  titleField: string;
  identityField: string;
};

export const CATALOGUE_META: Record<CatalogueResource, CatalogueMeta> = {
  events: {
    label: "Events",
    singular: "event",
    description: "Events and experiences in Goa. Slugs become the public URL.",
    uploadFolder: "events",
    titleField: "title",
    identityField: "id",
  },
  hotels: {
    label: "Hotels",
    singular: "hotel",
    description:
      "Stays shown on the hotel search and detail pages. Every save clears the public catalogue cache.",
    uploadFolder: "hotels",
    titleField: "name",
    identityField: "id",
  },
  holidays: {
    label: "Holidays",
    singular: "holiday",
    description:
      "Curated holiday packages, itineraries, and departure dates. Slugs become the public URL.",
    uploadFolder: "holidays",
    titleField: "title",
    identityField: "id",
  },
  cars: {
    label: "Cars",
    singular: "car",
    description:
      "Self-drive fleet entries for the rent-a-car pages, including host and deposit details.",
    uploadFolder: "cars",
    titleField: "model",
    identityField: "id",
  },
  offers: {
    label: "Offers",
    singular: "offer",
    description:
      "Promotional cards on the offers page. Artwork is optional; the icon and tone remain the fallback.",
    uploadFolder: "offers",
    titleField: "title",
    identityField: "id",
  },
};

export type CatalogueOption = { value: string; label: string };

type FieldBase = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
};

export type CatalogueField = FieldBase &
  (
    | {
        kind: "text";
        placeholder?: string;
        maxLength?: number;
        inputMode?: "text" | "numeric" | "decimal";
        /** Normalise as an identifier, slug, or upper-case code before validation. */
        format?: "identifier" | "slug" | "uppercase";
      }
    | { kind: "number"; min?: number; max?: number; step?: number }
    | { kind: "time" }
    | { kind: "date" }
    | { kind: "textarea"; rows?: number; placeholder?: string }
    | { kind: "select"; options: readonly CatalogueOption[] }
    | { kind: "city" }
    | { kind: "checkbox"; defaultChecked?: boolean }
    | { kind: "image"; optional?: boolean }
    | { kind: "gallery" }
    | { kind: "list"; rows?: number; placeholder?: string }
    | { kind: "multiselect"; options: readonly CatalogueOption[] }
    | { kind: "itinerary" }
    | { kind: "date-list"; rows?: number; placeholder?: string }
  );

export type CatalogueSection = {
  title: string;
  description?: string;
  fields: CatalogueField[];
};

const propertyTypeOptions: CatalogueOption[] = PROPERTY_TYPES.map((value) => ({
  value,
  label: value,
}));

const amenityOptions: CatalogueOption[] = Object.entries(AMENITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const themeOptions: CatalogueOption[] = HOLIDAY_THEME_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

const carTransmissionOptions: CatalogueOption[] = carTransmissionValues.map((value) => ({
  value,
  label: value,
}));

const carFuelOptions: CatalogueOption[] = carFuelValues.map((value) => ({
  value,
  label: value,
}));

const carHostOptions: CatalogueOption[] = ["Professional", "Individual"].map((value) => ({
  value,
  label: value,
}));

const offerCategoryOptions: CatalogueOption[] = offerServiceValues.map((value) => ({
  value,
  label:
    value === "hotels"
      ? "Stays"
      : value === "cars"
        ? "Rent a car"
        : value.charAt(0).toUpperCase() + value.slice(1),
}));

const offerIconOptions: CatalogueOption[] = offerIconValues.map((value) => ({
  value,
  label: value === "palmtree" ? "Palm tree" : value.charAt(0).toUpperCase() + value.slice(1),
}));

const offerToneOptions: CatalogueOption[] = offerToneValues.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const hotelSections: CatalogueSection[] = [
  {
    title: "Identity and location",
    description: "The id anchors links and enquiries, so keep it stable after the first save.",
    fields: [
      {
        kind: "text",
        name: "id",
        label: "Record id",
        required: true,
        format: "identifier",
        placeholder: "htl-goa-beach-house",
        hint: "Lower-case letters, numbers, and hyphens. It cannot change after creation.",
      },
      { kind: "text", name: "name", label: "Hotel name", required: true, wide: true },
      { kind: "city", name: "city_code", label: "City", required: true },
      { kind: "text", name: "area", label: "Area", required: true },
      {
        kind: "select",
        name: "property_type",
        label: "Property type",
        required: true,
        options: propertyTypeOptions,
      },
      {
        kind: "number",
        name: "star_rating",
        label: "Star rating",
        required: true,
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },
  {
    title: "Pricing and ratings",
    fields: [
      {
        kind: "number",
        name: "guest_rating",
        label: "Guest rating",
        required: true,
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        kind: "number",
        name: "review_count",
        label: "Review count",
        required: true,
        min: 0,
        step: 1,
      },
      {
        kind: "number",
        name: "price_per_night",
        label: "Price per night (₹)",
        required: true,
        min: 1,
        step: 1,
      },
      {
        kind: "number",
        name: "tax_percent",
        label: "Tax percent",
        required: true,
        min: 0,
        max: 30,
        step: 1,
      },
      {
        kind: "number",
        name: "distance_km",
        label: "Distance from centre (km)",
        required: true,
        min: 0,
        step: 0.1,
      },
    ],
  },
  {
    title: "Guest experience",
    fields: [
      { kind: "text", name: "room_type", label: "Room type", required: true },
      { kind: "time", name: "check_in", label: "Check-in time", required: true },
      { kind: "time", name: "check_out", label: "Check-out time", required: true },
      { kind: "checkbox", name: "breakfast", label: "Breakfast included" },
      { kind: "checkbox", name: "free_cancellation", label: "Free cancellation" },
      { kind: "checkbox", name: "featured", label: "Feature on the home page" },
      {
        kind: "multiselect",
        name: "amenities",
        label: "Amenities",
        wide: true,
        options: amenityOptions,
      },
    ],
  },
  {
    title: "Copy",
    fields: [
      { kind: "text", name: "tagline", label: "Tagline", required: true, wide: true },
      {
        kind: "textarea",
        name: "description",
        label: "Description",
        required: true,
        wide: true,
        rows: 5,
      },
    ],
  },
  {
    title: "Photography",
    description: "Uploaded to the hotels folder in Cloudinary. Reuse the URL anywhere.",
    fields: [
      { kind: "image", name: "image", label: "Main image", required: true },
      { kind: "gallery", name: "gallery", label: "Additional photos" },
    ],
  },
];

const holidaySections: CatalogueSection[] = [
  {
    title: "Identity and destination",
    fields: [
      {
        kind: "text",
        name: "id",
        label: "Record id",
        required: true,
        format: "identifier",
        placeholder: "holi-goa-susegad",
        hint: "Lower-case letters, numbers, and hyphens. It cannot change after creation.",
      },
      {
        kind: "text",
        name: "slug",
        label: "Public slug",
        required: true,
        format: "slug",
        placeholder: "susegad-by-the-sea",
        hint: "Used in /holidays/<slug>.",
      },
      { kind: "text", name: "title", label: "Title", required: true, wide: true },
      { kind: "city", name: "city_code", label: "Departure city", required: true },
      { kind: "text", name: "country", label: "Country", required: true },
      {
        kind: "number",
        name: "days",
        label: "Days",
        required: true,
        min: 2,
        max: 15,
        step: 1,
      },
      {
        kind: "number",
        name: "nights",
        label: "Nights",
        required: true,
        min: 1,
        max: 14,
        step: 1,
      },
      {
        kind: "number",
        name: "price_per_person",
        label: "Price per person (₹)",
        required: true,
        min: 1,
        step: 1,
      },
      {
        kind: "number",
        name: "rating",
        label: "Rating",
        required: true,
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        kind: "number",
        name: "review_count",
        label: "Review count",
        required: true,
        min: 0,
        step: 1,
      },
      { kind: "checkbox", name: "featured", label: "Feature on the home page" },
    ],
  },
  {
    title: "Story and themes",
    fields: [
      {
        kind: "textarea",
        name: "summary",
        label: "Summary",
        required: true,
        wide: true,
        rows: 4,
      },
      {
        kind: "multiselect",
        name: "themes",
        label: "Themes",
        wide: true,
        options: themeOptions,
      },
      {
        kind: "list",
        name: "highlights",
        label: "Highlights",
        required: true,
        wide: true,
        hint: "One highlight per line.",
      },
    ],
  },
  {
    title: "Inclusions and exclusions",
    fields: [
      {
        kind: "list",
        name: "inclusions",
        label: "Inclusions",
        required: true,
        wide: true,
        hint: "One inclusion per line.",
      },
      {
        kind: "list",
        name: "exclusions",
        label: "Exclusions",
        required: true,
        wide: true,
        hint: "One exclusion per line.",
      },
    ],
  },
  {
    title: "Departures and itinerary",
    fields: [
      {
        kind: "date-list",
        name: "departure_dates",
        label: "Departure dates",
        required: true,
        wide: true,
        hint: "One YYYY-MM-DD date per line.",
      },
      { kind: "itinerary", name: "itinerary", label: "Day-by-day itinerary", wide: true },
    ],
  },
  {
    title: "Photography",
    description: "Upload up to five photos in total, including the main image.",
    fields: [
      { kind: "image", name: "image", label: "Main image", required: true },
      {
        kind: "gallery",
        name: "gallery",
        label: "Additional photos",
        wide: true,
        hint: "Up to four additional photos.",
      },
    ],
  },
];

const carSections: CatalogueSection[] = [
  {
    title: "Identity and location",
    fields: [
      {
        kind: "text",
        name: "id",
        label: "Record id",
        required: true,
        format: "identifier",
        placeholder: "car-maruti-suzuki-alto-k10",
        hint: "Lower-case letters, numbers, and hyphens. It cannot change after creation.",
      },
      { kind: "text", name: "brand", label: "Brand", required: true },
      { kind: "text", name: "model", label: "Model", required: true },
      { kind: "text", name: "variant", label: "Variant", required: true },
      {
        kind: "number",
        name: "year",
        label: "Year",
        required: true,
        min: 2015,
        max: 2030,
        step: 1,
      },
      { kind: "city", name: "city_code", label: "City", required: true },
      {
        kind: "select",
        name: "car_type",
        label: "Car type",
        required: true,
        options: CAR_TYPE_OPTIONS,
      },
      {
        kind: "select",
        name: "transmission",
        label: "Transmission",
        required: true,
        options: carTransmissionOptions,
      },
      {
        kind: "select",
        name: "fuel",
        label: "Fuel",
        required: true,
        options: carFuelOptions,
      },
      {
        kind: "number",
        name: "seats",
        label: "Seats",
        required: true,
        min: 2,
        max: 9,
        step: 1,
      },
    ],
  },
  {
    title: "Pricing and ratings",
    fields: [
      {
        kind: "number",
        name: "price_per_hour",
        label: "Price per hour (₹)",
        required: true,
        min: 1,
        step: 1,
      },
      {
        kind: "number",
        name: "km_limit_per_day",
        label: "Daily kilometre limit",
        required: true,
        min: 1,
        step: 1,
      },
      {
        kind: "number",
        name: "rating",
        label: "Rating",
        required: true,
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        kind: "number",
        name: "review_count",
        label: "Review count",
        required: true,
        min: 0,
        step: 1,
      },
      {
        kind: "number",
        name: "distance_km",
        label: "Distance from centre (km)",
        required: true,
        min: 0,
        step: 0.1,
      },
      {
        kind: "number",
        name: "delivery_fee",
        label: "Delivery fee (₹)",
        required: true,
        min: 0,
        step: 1,
      },
      {
        kind: "number",
        name: "deposit",
        label: "Deposit (₹)",
        required: true,
        min: 0,
        step: 1,
      },
    ],
  },
  {
    title: "Host and extras",
    fields: [
      { kind: "text", name: "host_name", label: "Host name", required: true },
      {
        kind: "select",
        name: "host_type",
        label: "Host type",
        required: true,
        options: carHostOptions,
      },
      { kind: "checkbox", name: "fastag", label: "FASTag fitted" },
      { kind: "checkbox", name: "home_delivery", label: "Home delivery available" },
      { kind: "checkbox", name: "featured", label: "Feature on the home page" },
      { kind: "checkbox", name: "guest_favorite", label: "Mark as guest favourite" },
    ],
  },
  {
    title: "Copy",
    fields: [
      { kind: "text", name: "tagline", label: "Tagline", required: true, wide: true },
      {
        kind: "textarea",
        name: "description",
        label: "Description",
        required: true,
        wide: true,
        rows: 5,
      },
    ],
  },
  {
    title: "Photography",
    description: "Uploaded to the cars folder in Cloudinary.",
    fields: [
      { kind: "image", name: "image", label: "Main image", required: true },
      { kind: "gallery", name: "gallery", label: "Additional photos" },
    ],
  },
];

const offerSections: CatalogueSection[] = [
  {
    title: "Identity and category",
    fields: [
      {
        kind: "text",
        name: "id",
        label: "Record id",
        required: true,
        format: "identifier",
        placeholder: "off-013",
        hint: "Lower-case letters, numbers, and hyphens. It cannot change after creation.",
      },
      {
        kind: "select",
        name: "category",
        label: "Service",
        required: true,
        options: offerCategoryOptions,
      },
      { kind: "text", name: "eyebrow", label: "Eyebrow", required: true },
      { kind: "text", name: "title", label: "Title", required: true, wide: true },
      {
        kind: "text",
        name: "code",
        label: "Promo code",
        required: true,
        format: "uppercase",
        placeholder: "NESTFLY",
        hint: "4–16 upper-case letters or digits.",
      },
      {
        kind: "text",
        name: "discount_label",
        label: "Discount label",
        required: true,
        placeholder: "Up to 12% off",
      },
    ],
  },
  {
    title: "Presentation",
    fields: [
      {
        kind: "select",
        name: "icon",
        label: "Icon",
        required: true,
        options: offerIconOptions,
      },
      {
        kind: "select",
        name: "tone",
        label: "Tone",
        required: true,
        options: offerToneOptions,
      },
      {
        kind: "image",
        name: "image",
        label: "Card artwork (optional)",
        hint: "Optional. Without artwork the icon and tone carry the card.",
        optional: true,
      },
      { kind: "gallery", name: "gallery", label: "Additional photos" },
    ],
  },
  {
    title: "Copy and validity",
    fields: [
      {
        kind: "textarea",
        name: "description",
        label: "Description",
        required: true,
        wide: true,
        rows: 4,
      },
      {
        kind: "textarea",
        name: "terms",
        label: "Terms",
        required: true,
        wide: true,
        rows: 3,
      },
      { kind: "date", name: "valid_until", label: "Valid until", required: true },
      { kind: "checkbox", name: "featured", label: "Feature on the offers page" },
    ],
  },
  {
    title: "Call to action",
    fields: [
      { kind: "text", name: "cta_label", label: "Button label", required: true },
      {
        kind: "text",
        name: "cta_href",
        label: "Button link",
        required: true,
        placeholder: "/hotels",
      },
    ],
  },
];

export const CATALOGUE_SECTIONS: Record<CatalogueResource, CatalogueSection[]> = {
  events: [
    {
      title: "Identity and venue",
      description: "All events take place in Goa. The state cannot be changed.",
      fields: [
        { kind: "text", name: "id", label: "Record id", required: true, format: "identifier" },
        {
          kind: "text",
          name: "slug",
          label: "Public slug",
          required: true,
          format: "slug",
          hint: "Used in /events/<slug>.",
        },
        { kind: "text", name: "title", label: "Title", required: true, wide: true },
        {
          kind: "select",
          name: "category",
          label: "Category",
          required: true,
          options: EVENT_CATEGORY_OPTIONS,
        },
        { kind: "text", name: "venue", label: "Venue", required: true },
        { kind: "text", name: "area", label: "Area in Goa", required: true },
        {
          kind: "date",
          name: "event_date",
          label: "Event date",
          hint: "Leave blank for dates on request.",
        },
        { kind: "time", name: "start_time", label: "Start time" },
        {
          kind: "text",
          name: "price_label",
          label: "Price label",
          hint: "Leave blank for Get a custom quote.",
        },
        { kind: "checkbox", name: "featured", label: "Feature this event" },
        {
          kind: "checkbox",
          name: "show_in_banner",
          label: "Show in the live events banner",
          defaultChecked: true,
          hint: "Scheduled events appear in the scrolling banner at the top of every page.",
        },
      ],
    },
    {
      title: "Event details",
      fields: [
        { kind: "textarea", name: "summary", label: "Summary", required: true, wide: true },
        {
          kind: "textarea",
          name: "description",
          label: "Description",
          required: true,
          wide: true,
          rows: 5,
        },
        {
          kind: "list",
          name: "highlights",
          label: "Highlights",
          wide: true,
          hint: "One highlight per line.",
        },
      ],
    },
    {
      title: "Photography",
      description: "Uploaded to the events folder in Cloudinary. Up to five photos in total.",
      fields: [
        { kind: "image", name: "image", label: "Main image", required: true },
        { kind: "gallery", name: "gallery", label: "Additional photos" },
      ],
    },
  ],
  hotels: hotelSections,
  holidays: holidaySections,
  cars: carSections,
  offers: offerSections,
};

export const CATALOGUE_UNIQUE_FIELDS: Record<CatalogueResource, readonly string[]> = {
  events: ["slug"],
  hotels: [],
  holidays: ["slug"],
  cars: [],
  offers: ["code"],
};

export function catalogueFields(resource: CatalogueResource): CatalogueField[] {
  return CATALOGUE_SECTIONS[resource].flatMap((section) => section.fields);
}

export function catalogueFieldLabel(resource: CatalogueResource, name: string): string {
  return catalogueFields(resource).find((field) => field.name === name)?.label ?? name;
}

export function defaultFieldValue(field: CatalogueField): unknown {
  switch (field.kind) {
    case "checkbox":
      return field.defaultChecked ?? false;
    case "multiselect":
    case "gallery":
    case "list":
    case "itinerary":
    case "date-list":
      return [];
    default:
      return "";
  }
}

/**
 * Pass only the fields the editor renders to the client. This keeps Mongo
 * internals out of the RSC payload and gives every control a safe default.
 */
export function toCatalogueFormValues(
  resource: CatalogueResource,
  record: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of catalogueFields(resource)) {
    const value = record[field.name];
    values[field.name] = value === undefined || value === null ? defaultFieldValue(field) : value;
  }

  return values;
}
