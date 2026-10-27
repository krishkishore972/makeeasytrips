import { NextResponse } from "next/server";
import { getCities } from "@/lib/data/cities";
import { getFlightCities } from "@/lib/data/flights";
import { getHotelCities } from "@/lib/data/hotels";

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope") ?? "all";

  if (scope === "flights") {
    const cities = await getFlightCities();
    return NextResponse.json(
      { data: cities, meta: { count: cities.length, scope } },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  }

  if (scope === "hotels") {
    const cities = await getHotelCities();
    return NextResponse.json(
      { data: cities, meta: { count: cities.length, scope } },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  }

  if (scope !== "all") {
    return NextResponse.json(
      { error: "Unknown scope. Use 'all', 'flights', or 'hotels'." },
      { status: 400 },
    );
  }

  const cities = await getCities();
  return NextResponse.json(
    { data: cities, meta: { count: cities.length, scope } },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
