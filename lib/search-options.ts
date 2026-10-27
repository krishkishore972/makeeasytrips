export const cabinValues = ["economy", "premium", "business"] as const;
export type Cabin = (typeof cabinValues)[number];

export const CABIN_OPTIONS: { value: Cabin; label: string; short: string }[] = [
  { value: "economy", label: "Economy", short: "Economy" },
  { value: "premium", label: "Premium economy", short: "Premium" },
  { value: "business", label: "Business", short: "Business" },
];

export const flightSortValues = ["best", "cheapest", "quickest", "earliest"] as const;
export type FlightSort = (typeof flightSortValues)[number];

export const FLIGHT_SORT_OPTIONS: { value: FlightSort; label: string; detail: string }[] = [
  { value: "best", label: "Best overall", detail: "Fare, time, and stops balanced" },
  { value: "cheapest", label: "Cheapest", detail: "Lowest fare first" },
  { value: "quickest", label: "Quickest", detail: "Shortest total journey" },
  { value: "earliest", label: "Earliest", detail: "First departure first" },
];

export const departureWindowValues = ["early", "morning", "afternoon", "evening"] as const;
export type DepartureWindow = (typeof departureWindowValues)[number];

export const DEPARTURE_WINDOW_OPTIONS: {
  value: DepartureWindow;
  label: string;
  detail: string;
}[] = [
  { value: "early", label: "Early morning", detail: "12 am – 6 am" },
  { value: "morning", label: "Morning", detail: "6 am – 12 pm" },
  { value: "afternoon", label: "Afternoon", detail: "12 pm – 6 pm" },
  { value: "evening", label: "Evening", detail: "6 pm – 12 am" },
];

export const durationBandValues = ["short", "medium", "long"] as const;
export type DurationBand = (typeof durationBandValues)[number];

export const DURATION_BAND_OPTIONS: { value: DurationBand; label: string }[] = [
  { value: "short", label: "Under 2 hours" },
  { value: "medium", label: "2 – 4 hours" },
  { value: "long", label: "Over 4 hours" },
];

export const stopValues = ["0", "1"] as const;
export type StopFilter = (typeof stopValues)[number];

export const STOP_OPTIONS: { value: StopFilter; label: string }[] = [
  { value: "0", label: "Nonstop" },
  { value: "1", label: "1 stop" },
];

export const hotelSortValues = [
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "stars",
] as const;
export type HotelSort = (typeof hotelSortValues)[number];

export const HOTEL_SORT_OPTIONS: { value: HotelSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Guest rating" },
  { value: "stars", label: "Star rating" },
];

export const priceBandValues = ["budget", "mid", "premium", "luxury"] as const;
export type PriceBand = (typeof priceBandValues)[number];

export const PRICE_BAND_OPTIONS: {
  value: PriceBand;
  label: string;
  detail: string;
}[] = [
  { value: "budget", label: "Under ₹5,000", detail: "per night" },
  { value: "mid", label: "₹5,000 – ₹9,000", detail: "per night" },
  { value: "premium", label: "₹9,000 – ₹15,000", detail: "per night" },
  { value: "luxury", label: "Over ₹15,000", detail: "per night" },
];

export const starValues = [5, 4, 3] as const;
export type StarFilter = (typeof starValues)[number];

export const GUEST_RATING_OPTIONS: { value: string; label: string }[] = [
  { value: "8", label: "8.0 and above" },
  { value: "8.5", label: "8.5 and above" },
  { value: "9", label: "9.0 and above" },
];

export const amenityFilterValues = [
  "wifi",
  "pool",
  "spa",
  "gym",
  "restaurant",
  "bar",
  "airport-shuttle",
  "beach-access",
  "pet-friendly",
  "workspace",
] as const;
export type AmenityFilter = (typeof amenityFilterValues)[number];

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  breakfast: "Breakfast",
  pool: "Pool",
  spa: "Spa",
  gym: "Gym",
  restaurant: "Restaurant",
  bar: "Bar",
  "airport-shuttle": "Airport shuttle",
  parking: "Parking",
  "pet-friendly": "Pet friendly",
  workspace: "Workspace",
  laundry: "Laundry",
  "room-service": "Room service",
  "beach-access": "Beach access",
  kitchenette: "Kitchenette",
  terrace: "Terrace",
};

export const AMENITY_FILTER_OPTIONS: { value: AmenityFilter; label: string }[] = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "pool", label: "Pool" },
  { value: "spa", label: "Spa" },
  { value: "gym", label: "Gym" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "airport-shuttle", label: "Airport shuttle" },
  { value: "beach-access", label: "Beach access" },
  { value: "pet-friendly", label: "Pet friendly" },
  { value: "workspace", label: "Workspace" },
];

export const PROPERTY_TYPES = [
  "Hotel",
  "Resort",
  "Boutique Hotel",
  "Heritage Hotel",
  "Homestay",
  "Villa",
] as const;

/* -------------------------------------------------------------------------- */
/*  Holidays                                                                  */
/* -------------------------------------------------------------------------- */

export const holidaySortValues = [
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "duration",
] as const;
export type HolidaySort = (typeof holidaySortValues)[number];

export const HOLIDAY_SORT_OPTIONS: { value: HolidaySort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Traveller rating" },
  { value: "duration", label: "Longest first" },
];

export const holidayThemeValues = [
  "beach",
  "backwaters",
  "mountains",
  "heritage",
  "food",
  "wellness",
  "wildlife",
  "city",
  "adventure",
  "craft",
] as const;
export type HolidayTheme = (typeof holidayThemeValues)[number];

export const HOLIDAY_THEME_OPTIONS: { value: HolidayTheme; label: string }[] = [
  { value: "beach", label: "Beach" },
  { value: "backwaters", label: "Backwaters" },
  { value: "mountains", label: "Mountains" },
  { value: "heritage", label: "Heritage" },
  { value: "food", label: "Food" },
  { value: "wellness", label: "Wellness" },
  { value: "wildlife", label: "Wildlife" },
  { value: "city", label: "City" },
  { value: "adventure", label: "Adventure" },
  { value: "craft", label: "Craft" },
];

export const HOLIDAY_THEME_LABELS: Record<string, string> = Object.fromEntries(
  HOLIDAY_THEME_OPTIONS.map((option) => [option.value, option.label]),
);

export const holidayDurationValues = ["short", "medium", "long"] as const;
export type HolidayDuration = (typeof holidayDurationValues)[number];

export const HOLIDAY_DURATION_OPTIONS: {
  value: HolidayDuration;
  label: string;
  detail: string;
}[] = [
  { value: "short", label: "2–3 days", detail: "A quick reset" },
  { value: "medium", label: "4–5 days", detail: "The classic break" },
  { value: "long", label: "6+ days", detail: "Room to roam" },
];

export const holidayPriceBandValues = ["under-20k", "20k-35k", "35k-50k", "over-50k"] as const;
export type HolidayPriceBand = (typeof holidayPriceBandValues)[number];

export const HOLIDAY_PRICE_BAND_OPTIONS: {
  value: HolidayPriceBand;
  label: string;
  detail: string;
}[] = [
  { value: "under-20k", label: "Under ₹20,000", detail: "per person" },
  { value: "20k-35k", label: "₹20,000 – ₹35,000", detail: "per person" },
  { value: "35k-50k", label: "₹35,000 – ₹50,000", detail: "per person" },
  { value: "over-50k", label: "Over ₹50,000", detail: "per person" },
];

/* -------------------------------------------------------------------------- */
/*  Offers                                                                    */
/* -------------------------------------------------------------------------- */

export const offerServiceValues = ["flights", "hotels", "holidays", "trains", "cabs"] as const;
export type OfferService = (typeof offerServiceValues)[number];

export const offerCategoryValues = ["all", ...offerServiceValues] as const;
export type OfferCategory = (typeof offerCategoryValues)[number];

export const OFFER_CATEGORY_OPTIONS: { value: OfferCategory; label: string }[] = [
  { value: "all", label: "All offers" },
  { value: "flights", label: "Flights" },
  { value: "hotels", label: "Stays" },
  { value: "holidays", label: "Holidays" },
  { value: "trains", label: "Trains" },
  { value: "cabs", label: "Cabs" },
];

export const offerToneValues = ["coral", "teal", "gold"] as const;
export type OfferTone = (typeof offerToneValues)[number];

export const offerIconValues = [
  "plane",
  "bed",
  "palmtree",
  "train",
  "car",
  "sparkles",
  "tag",
  "percent",
  "gift",
  "calendar",
  "sun",
  "map",
] as const;
export type OfferIcon = (typeof offerIconValues)[number];
