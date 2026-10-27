import { NextResponse } from "next/server";
import { searchHolidays } from "@/lib/data/holidays";
import { holidayPriceBreakdown } from "@/lib/pricing";
import { parseHolidaySearchParams } from "@/lib/validation/search";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = parseHolidaySearchParams(params);

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const holidays = await searchHolidays(parsed.query);

  return NextResponse.json(
    {
      data: holidays.map((holiday) => {
        const price = holidayPriceBreakdown(holiday.price_per_person, parsed.query.travellers);

        return {
          id: holiday.id,
          slug: holiday.slug,
          title: holiday.title,
          city: holiday.city_code,
          country: holiday.country,
          days: holiday.days,
          nights: holiday.nights,
          themes: holiday.themes,
          rating: holiday.rating,
          reviewCount: holiday.review_count,
          image: holiday.image,
          summary: holiday.summary,
          pricePerPerson: holiday.price_per_person,
          totalForTravellers: price.total,
          nextDeparture: holiday.departure_dates[0] ?? null,
          featured: holiday.featured,
        };
      }),
      meta: {
        count: holidays.length,
        currency: "INR",
        query: {
          destination: parsed.query.destination,
          themes: parsed.query.themes,
          durations: parsed.query.durations,
          priceBands: parsed.query.priceBands,
          sort: parsed.query.sort,
          travellers: parsed.query.travellers,
        },
      },
    },
    { headers: CACHE_HEADERS },
  );
}
