import { NextResponse } from "next/server";
import { fareFor, getFlightById } from "@/lib/data/flights";
import { parseFlightSearchParams } from "@/lib/validation/search";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const flight = await getFlightById(id);

  if (!flight) {
    return NextResponse.json({ error: "Flight not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const parsed = parseFlightSearchParams({
    cabin: url.searchParams.get("cabin") ?? undefined,
    pax: url.searchParams.get("pax") ?? undefined,
  });
  const fare = fareFor(flight, parsed.query.cabin);

  return NextResponse.json(
    {
      data: {
        id: flight.id,
        airline: flight.airline,
        airlineCode: flight.airline_code,
        flightNumber: flight.flight_number,
        from: flight.from_code,
        to: flight.to_code,
        departTime: flight.depart_time,
        arriveTime: flight.arrive_time,
        arriveDayOffset: flight.arrive_day_offset,
        durationMinutes: flight.duration_minutes,
        stops: flight.stops,
        via: flight.via,
        aircraft: flight.aircraft,
        cabin: parsed.query.cabin,
        fare,
        totalFare: fare * parsed.query.pax,
        travellers: parsed.query.pax,
        refundable: flight.refundable,
        fareBrand: flight.fare_brand,
        baggage: {
          checkInKg: flight.baggage_checkin,
          cabinKg: flight.baggage_cabin,
        },
        mealIncluded: flight.meal_included,
        onTimePercent: flight.on_time,
        seatsLeft: flight.seats_left,
        carbonKg: flight.carbon_kg,
      },
      meta: { currency: "INR" },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}
