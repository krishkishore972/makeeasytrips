export const EVENT_CATEGORIES = [
  "music",
  "nightlife",
  "celebrations",
  "corporate",
  "weddings",
  "culture",
] as const;

export const EVENT_CATEGORY_OPTIONS = EVENT_CATEGORIES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));
