import { NextResponse } from "next/server";
import { nightsBetween } from "@/lib/dates";
import { searchHotels } from "@/lib/data/hotels";
import { hotelStayBreakdown } from "@/lib/pricing";
import { parseHotelSearchParams } from "@/lib/validation/search";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = parseHotelSearchParams(params);

  if (!parsed.query.city) {
    return NextResponse.json({ error: "A three-letter 'city' code is required." }, { status: 400 });
  }

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const hotels = await searchHotels(parsed.query);
  const nights =
    parsed.query.checkIn && parsed.query.checkOut
      ? nightsBetween(parsed.query.checkIn, parsed.query.checkOut)
      : 1;

  return NextResponse.json(
    {
      data: hotels.map((hotel) => {
        const price = hotelStayBreakdown(
          hotel.price_per_night,
          nights,
          parsed.query.rooms,
          hotel.tax_percent,
        );
        return {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city_code,
          area: hotel.area,
          propertyType: hotel.property_type,
          starRating: hotel.star_rating,
          guestRating: hotel.guest_rating,
          reviewCount: hotel.review_count,
          image: hotel.image,
          amenities: hotel.amenities,
          roomType: hotel.room_type,
          breakfast: hotel.breakfast,
          freeCancellation: hotel.free_cancellation,
          distanceFromCentreKm: hotel.distance_km,
          tagline: hotel.tagline,
          pricePerNight: hotel.price_per_night,
          taxPercent: hotel.tax_percent,
          stayTotal: price.total,
        };
      }),
      meta: {
        count: hotels.length,
        currency: "INR",
        query: {
          city: parsed.query.city,
          checkIn: parsed.query.checkIn,
          checkOut: parsed.query.checkOut,
          nights,
          rooms: parsed.query.rooms,
          guests: parsed.query.guests,
          sort: parsed.query.sort,
        },
      },
    },
    { headers: CACHE_HEADERS },
  );
}
