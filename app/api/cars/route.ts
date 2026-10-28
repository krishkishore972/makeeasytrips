import { NextResponse } from "next/server";
import { searchCars } from "@/lib/data/cars";
import { carRentalBreakdown } from "@/lib/pricing";
import { parseCarSearchParams } from "@/lib/validation/search";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsed = parseCarSearchParams(params);

  if (!parsed.query.city) {
    return NextResponse.json({ error: "A three-letter 'city' code is required." }, { status: 400 });
  }

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const cars = await searchCars(parsed.query);

  return NextResponse.json(
    {
      data: cars.map((car) => {
        const price = carRentalBreakdown(car.price_per_hour, {
          days: parsed.query.days,
          kmPlanExtraPerDay: 0,
          delivery: false,
          deliveryFee: car.delivery_fee,
          addons: [],
          deposit: car.deposit,
        });
        return {
          id: car.id,
          brand: car.brand,
          model: car.model,
          variant: car.variant,
          year: car.year,
          city: car.city_code,
          carType: car.car_type,
          transmission: car.transmission,
          fuel: car.fuel,
          seats: car.seats,
          rating: car.rating,
          reviewCount: car.review_count,
          distanceFromCentreKm: car.distance_km,
          hostName: car.host_name,
          hostType: car.host_type,
          fastag: car.fastag,
          homeDelivery: car.home_delivery,
          deliveryFee: car.delivery_fee,
          deposit: car.deposit,
          image: car.image,
          tagline: car.tagline,
          guestFavorite: car.guest_favorite,
          pricePerHour: car.price_per_hour,
          tripTotal: price.total,
        };
      }),
      meta: {
        count: cars.length,
        currency: "INR",
        query: {
          city: parsed.query.city,
          start: parsed.query.start,
          end: parsed.query.end,
          hours: parsed.query.hours,
          days: parsed.query.days,
          mode: parsed.query.mode,
          sort: parsed.query.sort,
        },
      },
    },
    { headers: CACHE_HEADERS },
  );
}
