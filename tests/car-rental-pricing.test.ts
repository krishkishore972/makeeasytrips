import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import cars from "@/data/cars.json";
import { GET as searchCarsApi } from "@/app/api/cars/route";
import { GET as carDetailApi } from "@/app/api/cars/[id]/route";
import { CarCard } from "@/components/cars/car-card";
import { readCollection } from "@/lib/data/mongo";
import { carSchema } from "@/lib/data/schemas";

const car = carSchema.parse(cars[0]);

describe("daily and weekly car pricing", () => {
  it("normalizes car data cached before the daily and weekly pricing change", async () => {
    const { price_per_day, price_per_week, ...rest } = car;
    vi.mocked(readCollection).mockResolvedValueOnce([{ ...rest, price_per_hour: 149 }]);
    const response = await searchCarsApi(new Request("http://localhost/api/cars?city=BLR"));
    const { data } = await response.json();
    expect(data[0].pricePerDay).toBe(price_per_day);
    expect(data[0].pricePerWeek).toBe(price_per_week);
    expect(Number.isFinite(data[0].tripTotal)).toBe(true);
  });

  it("exposes daily and weekly rates without hourly fields in the search API", async () => {
    const response = await searchCarsApi(
      new Request("http://localhost/api/cars?city=BLR&start=2027-01-01T10:00&end=2027-01-09T10:00"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    const result = body.data.find((item: { id: string }) => item.id === car.id);
    expect(result).toMatchObject({
      pricePerDay: car.price_per_day,
      pricePerWeek: car.price_per_week,
    });
    expect(result).not.toHaveProperty("pricePerHour");
    const base = car.price_per_week + car.price_per_day;
    expect(result.tripTotal).toBe(base + Math.round(base * 0.18));
  });

  it("uses a weekly block and remaining daily blocks in the detail API", async () => {
    const response = await carDetailApi(
      new Request(
        `http://localhost/api/cars/${car.id}?start=2027-01-01T10:00&end=2027-01-09T10:00`,
      ),
      { params: Promise.resolve({ id: car.id }) },
    );
    const { data } = await response.json();
    expect(data).not.toHaveProperty("pricePerHour");
    expect(data.pricePerDay).toBe(car.price_per_day);
    expect(data.pricePerWeek).toBe(car.price_per_week);
    expect(data.priceBreakdown).toMatchObject({
      weeks: 1,
      remainingDays: 1,
      base: car.price_per_week + car.price_per_day,
    });
  });

  it("shows daily and weekly rates on car cards", () => {
    const html = renderToStaticMarkup(
      createElement(CarCard, {
        car,
        query: { start: "2027-01-01T10:00", end: "2027-01-09T10:00", days: 8, mode: "daily" },
      }),
    );
    expect(html).toContain("/ day");
    expect(html).toContain("/ week");
    expect(html).not.toMatch(/\/\s*(hour|hr)\b/i);
  });

  it("converts legacy records without leaking their old rate field", () => {
    const { price_per_day, price_per_week, ...rest } = car;
    const converted = carSchema.parse({ ...rest, price_per_hour: 149 });
    expect(converted.price_per_day).toBe(price_per_day);
    expect(converted.price_per_week).toBe(price_per_week);
    expect(converted).not.toHaveProperty("price_per_hour");
  });

  it("preserves explicit rates when a legacy record has been edited", () => {
    const converted = carSchema.parse({
      ...car,
      price_per_day: 2000,
      price_per_week: 12000,
      price_per_hour: 149,
    });
    expect(converted.price_per_day).toBe(2000);
    expect(converted.price_per_week).toBe(12000);
  });

  it.each(["price_per_day", "price_per_week"])("requires a valid %s on new records", (field) => {
    expect(carSchema.safeParse({ ...car, [field]: undefined }).success).toBe(false);
    expect(carSchema.safeParse({ ...car, [field]: 0 }).success).toBe(false);
    expect(carSchema.safeParse({ ...car, [field]: -1 }).success).toBe(false);
  });
});
