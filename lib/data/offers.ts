import { readCsvOnce } from "@/lib/data/csv";
import { offerSchema, type Offer } from "@/lib/data/schemas";
import {
  visibleOfferServiceValues,
  type OfferCategory,
  type VisibleOfferService,
} from "@/lib/search-options";

export type OfferCategoryCount = {
  value: OfferCategory;
  count: number;
};

const visibleCategories = new Set<string>(visibleOfferServiceValues);

function isVisible(offer: Offer) {
  return visibleCategories.has(offer.category);
}

export function getOffers(): Promise<Offer[]> {
  return readCsvOnce("offers.csv", offerSchema);
}

export async function getOfferById(id: string): Promise<Offer | undefined> {
  const offers = await getOffers();
  return offers.find((offer) => offer.id === id);
}

/**
 * The CSV keeps the flight and train rows for future supply, but the public
 * board only shows travel lines the business can currently fulfil.
 */
export async function getOffersByCategory(category: OfferCategory): Promise<Offer[]> {
  const offers = await getOffers();
  const filtered = offers.filter((offer) => {
    if (!isVisible(offer)) return false;
    return category === "all" || offer.category === category;
  });

  return filtered.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      a.valid_until.localeCompare(b.valid_until) ||
      a.title.localeCompare(b.title),
  );
}

export async function getFeaturedOffers(limit = 3): Promise<Offer[]> {
  const offers = await getOffers();
  return offers
    .filter((offer) => offer.featured && isVisible(offer))
    .sort((a, b) => a.valid_until.localeCompare(b.valid_until))
    .slice(0, limit);
}

export async function getOfferCategoryCounts(): Promise<OfferCategoryCount[]> {
  const offers = (await getOffers()).filter(isVisible);
  const counts = new Map<VisibleOfferService, number>();

  for (const offer of offers) {
    const category = offer.category as VisibleOfferService;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [
    { value: "all", count: offers.length },
    ...visibleOfferServiceValues.map((value) => ({
      value,
      count: counts.get(value) ?? 0,
    })),
  ];
}
