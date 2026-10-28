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
/*  Rent a car                                                                */
/* -------------------------------------------------------------------------- */

export const carTypeValues = [
  "Hatchback",
  "Compact SUV",
  "MUV/MPV",
  "SUV",
  "Compact Sedan",
  "Sedan",
] as const;
export type CarType = (typeof carTypeValues)[number];

export const CAR_TYPE_OPTIONS: { value: CarType; label: string }[] = [
  { value: "Hatchback", label: "Hatchback" },
  { value: "Compact SUV", label: "Compact SUV" },
  { value: "MUV/MPV", label: "MUV/MPV" },
  { value: "SUV", label: "SUV" },
  { value: "Compact Sedan", label: "Compact sedan" },
  { value: "Sedan", label: "Sedan" },
];

export const carTransmissionValues = ["Manual", "Automatic"] as const;
export type CarTransmission = (typeof carTransmissionValues)[number];

export const carFuelValues = ["Petrol", "Diesel", "Electric"] as const;
export type CarFuel = (typeof carFuelValues)[number];

export const carSeatBandValues = ["4-5", "6-7"] as const;
export type CarSeatBand = (typeof carSeatBandValues)[number];

export const CAR_SEAT_BAND_OPTIONS: { value: CarSeatBand; label: string }[] = [
  { value: "4-5", label: "4/5 seater" },
  { value: "6-7", label: "6/7 seater" },
];

export const carRatingValues = ["3.5", "4.0", "4.2", "4.5"] as const;
export type CarRatingFilter = (typeof carRatingValues)[number];

export const CAR_RATING_OPTIONS: { value: CarRatingFilter; label: string }[] = [
  { value: "4.5", label: "4.5+ rated" },
  { value: "4.2", label: "4.2+ rated" },
  { value: "4.0", label: "4.0+ rated" },
  { value: "3.5", label: "3.5+ rated" },
];

export const carBudgetValues = ["under-300", "300-600", "600-1000", "over-1000"] as const;
export type CarBudget = (typeof carBudgetValues)[number];

export const CAR_BUDGET_OPTIONS: { value: CarBudget; label: string; detail: string }[] = [
  { value: "under-300", label: "Under ₹300", detail: "per hour" },
  { value: "300-600", label: "₹300 – ₹600", detail: "per hour" },
  { value: "600-1000", label: "₹600 – ₹1,000", detail: "per hour" },
  { value: "over-1000", label: "Over ₹1,000", detail: "per hour" },
];

export const carSortValues = [
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "distance",
] as const;
export type CarSort = (typeof carSortValues)[number];

export const CAR_SORT_OPTIONS: { value: CarSort; label: string }[] = [
  { value: "recommended", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Ratings: high to low" },
  { value: "distance", label: "Distance: nearest first" },
];

export const carModeValues = ["daily", "subscription", "weekday"] as const;
export type CarMode = (typeof carModeValues)[number];

export const CAR_MODE_OPTIONS: {
  value: CarMode;
  label: string;
  detail: string;
  minimumDays: number;
}[] = [
  {
    value: "daily",
    label: "Daily Drives",
    detail: "Short trips, up to 7 days",
    minimumDays: 1,
  },
  {
    value: "subscription",
    label: "Subscription",
    detail: "Long-duration rentals, 7+ days",
    minimumDays: 7,
  },
  {
    value: "weekday",
    label: "Weekday Pass",
    detail: "Mon–Fri fixed-km rentals",
    minimumDays: 5,
  },
];

export const carKmPlanValues = ["included", "unlimited"] as const;
export type CarKmPlan = (typeof carKmPlanValues)[number];

export const CAR_KM_PLAN_OPTIONS: {
  value: CarKmPlan;
  label: string;
  detail: string;
  extraPerDay: number;
}[] = [
  {
    value: "included",
    label: "300 km included",
    detail: "Then ₹12 per extra kilometre",
    extraPerDay: 0,
  },
  {
    value: "unlimited",
    label: "Unlimited kilometres",
    detail: "No distance anxiety for the long way round",
    extraPerDay: 399,
  },
];

export const carAddonValues = ["fastag", "child-seat", "additional-driver"] as const;
export type CarAddon = (typeof carAddonValues)[number];

export const CAR_ADDON_OPTIONS: {
  value: CarAddon;
  label: string;
  detail: string;
  price: number;
  perDay: boolean;
}[] = [
  {
    value: "fastag",
    label: "Active FASTag",
    detail: "Toll charges are still billed separately",
    price: 149,
    perDay: false,
  },
  {
    value: "child-seat",
    label: "Child seat",
    detail: "A forward-facing seat for ages 2–5",
    price: 199,
    perDay: true,
  },
  {
    value: "additional-driver",
    label: "Additional driver",
    detail: "Share the wheel with a verified co-driver",
    price: 249,
    perDay: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Offers                                                                    */
/* -------------------------------------------------------------------------- */

export const offerServiceValues = ["flights", "hotels", "holidays", "trains", "cars"] as const;
export type OfferService = (typeof offerServiceValues)[number];

/** Flights and trains stay in the catalogue but are not promoted while the business has no supply. */
export const visibleOfferServiceValues = ["hotels", "holidays", "cars"] as const;
export type VisibleOfferService = (typeof visibleOfferServiceValues)[number];

export const offerCategoryValues = ["all", ...offerServiceValues] as const;
export type OfferCategory = (typeof offerCategoryValues)[number];

export const OFFER_CATEGORY_OPTIONS: { value: OfferCategory; label: string }[] = [
  { value: "all", label: "All offers" },
  { value: "hotels", label: "Stays" },
  { value: "holidays", label: "Holidays" },
  { value: "cars", label: "Rent a car" },
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
