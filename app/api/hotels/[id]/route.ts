import { NextResponse } from "next/server";
import { getHotelById } from "@/lib/data/hotels";
import { hotelStayBreakdown } from "@/lib/pricing";
import { parseStayParams } from "@/lib/validation/search";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const hotel = await getHotelById(id);

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const stayParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    stayParams[key] = value;
  });
  const stay = parseStayParams(stayParams);
  const price = hotelStayBreakdown(
    hotel.price_per_night,
    stay.nights,
    stay.rooms,
    hotel.tax_percent,
  );

  return NextResponse.json(
    {
      data: {
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
        checkIn: hotel.check_in,
        checkOut: hotel.check_out,
        distanceFromCentreKm: hotel.distance_km,
        tagline: hotel.tagline,
        description: hotel.description,
        pricePerNight: hotel.price_per_night,
        taxPercent: hotel.tax_percent,
        stay: {
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          nights: stay.nights,
          rooms: stay.rooms,
          guests: stay.guests,
        },
        priceBreakdown: price,
      },
      meta: { currency: "INR" },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}
