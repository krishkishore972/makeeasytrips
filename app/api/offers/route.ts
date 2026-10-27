import { NextResponse } from "next/server";
import { getOfferCategoryCounts, getOffersByCategory } from "@/lib/data/offers";
import { parseOfferSearchParams } from "@/lib/validation/search";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = parseOfferSearchParams(params);

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const [offers, categories] = await Promise.all([
    getOffersByCategory(parsed.category),
    getOfferCategoryCounts(),
  ]);

  return NextResponse.json(
    {
      data: offers.map((offer) => ({
        id: offer.id,
        category: offer.category,
        eyebrow: offer.eyebrow,
        title: offer.title,
        description: offer.description,
        code: offer.code,
        discountLabel: offer.discount_label,
        icon: offer.icon,
        tone: offer.tone,
        ctaLabel: offer.cta_label,
        ctaHref: offer.cta_href,
        validUntil: offer.valid_until,
        terms: offer.terms,
        featured: offer.featured,
      })),
      meta: {
        count: offers.length,
        category: parsed.category,
        categories,
      },
    },
    { headers: CACHE_HEADERS },
  );
}
