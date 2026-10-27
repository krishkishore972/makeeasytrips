import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/data/flights";
import { parseFlightSearchParams } from "@/lib/validation/search";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = parseFlightSearchParams(params);

  if (!parsed.query.from || !parsed.query.to) {
    return NextResponse.json(
      { error: "Both 'from' and 'to' three-letter airport codes are required." },
      { status: 400 },
    );
  }

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const results = await searchFlights(parsed.query);

  return NextResponse.json(
    {
      data: results.map(({ flight, fare, totalFare }) => ({
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
        totalFare,
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
      })),
      meta: {
        count: results.length,
        currency: "INR",
        query: {
          from: parsed.query.from,
          to: parsed.query.to,
          depart: parsed.query.depart,
          return: parsed.query.returnDate,
          travellers: parsed.query.pax,
          cabin: parsed.query.cabin,
          sort: parsed.query.sort,
        },
      },
    },
    { headers: CACHE_HEADERS },
  );
}
