import { NextResponse } from "next/server";
import { getCity } from "@/lib/data/cities";
import { getHolidayBySlug } from "@/lib/data/holidays";
import { holidayPriceBreakdown } from "@/lib/pricing";
import { parseHolidaySearchParams } from "@/lib/validation/search";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const holiday = await getHolidayBySlug(slug);

  if (!holiday) {
    return NextResponse.json({ error: "Holiday package not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  const parsed = parseHolidaySearchParams(queryParams);
  const travellers = parsed.query.travellers;
  const price = holidayPriceBreakdown(holiday.price_per_person, travellers);
  const city = await getCity(holiday.city_code);

  return NextResponse.json(
    {
      data: {
        id: holiday.id,
        slug: holiday.slug,
        title: holiday.title,
        city: holiday.city_code,
        cityName: city?.name ?? holiday.city_code,
        country: holiday.country,
        days: holiday.days,
        nights: holiday.nights,
        themes: holiday.themes,
        rating: holiday.rating,
        reviewCount: holiday.review_count,
        image: holiday.image,
        gallery: holiday.gallery,
        summary: holiday.summary,
        highlights: holiday.highlights,
        inclusions: holiday.inclusions,
        exclusions: holiday.exclusions,
        itinerary: holiday.itinerary,
        departureDates: holiday.departure_dates,
        featured: holiday.featured,
        pricePerPerson: holiday.price_per_person,
        travellers,
        priceBreakdown: price,
      },
      meta: { currency: "INR" },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}
