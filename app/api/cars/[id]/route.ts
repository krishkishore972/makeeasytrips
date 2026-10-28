import { NextResponse } from "next/server";
import { getCarById } from "@/lib/data/cars";
import { carRentalBreakdown } from "@/lib/pricing";
import { parseRentalParams } from "@/lib/validation/search";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    return NextResponse.json({ error: "Car not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const rentalParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    rentalParams[key] = value;
  });
  const rental = parseRentalParams(rentalParams);
  const price = carRentalBreakdown(car.price_per_hour, {
    days: rental.days,
    kmPlanExtraPerDay: 0,
    delivery: false,
    deliveryFee: car.delivery_fee,
    addons: [],
    deposit: car.deposit,
  });

  return NextResponse.json(
    {
      data: {
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
        description: car.description,
        kmLimitPerDay: car.km_limit_per_day,
        pricePerHour: car.price_per_hour,
        rental: {
          start: rental.start,
          end: rental.end,
          hours: rental.hours,
          days: rental.days,
        },
        priceBreakdown: price,
      },
      meta: { currency: "INR" },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}
