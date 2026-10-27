import { readCsvOnce } from "@/lib/data/csv";
import { offerSchema, type Offer } from "@/lib/data/schemas";
import type { OfferCategory, OfferService } from "@/lib/search-options";

export type OfferCategoryCount = {
  value: OfferCategory;
  count: number;
};

export function getOffers(): Promise<Offer[]> {
  return readCsvOnce("offers.csv", offerSchema);
}

export async function getOfferById(id: string): Promise<Offer | undefined> {
  const offers = await getOffers();
  return offers.find((offer) => offer.id === id);
}

export async function getOffersByCategory(category: OfferCategory): Promise<Offer[]> {
  const offers = await getOffers();
  const filtered =
    category === "all" ? offers : offers.filter((offer) => offer.category === category);

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
    .filter((offer) => offer.featured)
    .sort((a, b) => a.valid_until.localeCompare(b.valid_until))
    .slice(0, limit);
}

export async function getOfferCategoryCounts(): Promise<OfferCategoryCount[]> {
  const offers = await getOffers();
  const counts = new Map<OfferService, number>();

  for (const offer of offers) {
    counts.set(offer.category, (counts.get(offer.category) ?? 0) + 1);
  }

  return [
    { value: "all", count: offers.length },
    ...(["flights", "hotels", "holidays", "trains", "cabs"] as const).map((value) => ({
      value,
      count: counts.get(value) ?? 0,
    })),
  ];
}
