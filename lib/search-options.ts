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
