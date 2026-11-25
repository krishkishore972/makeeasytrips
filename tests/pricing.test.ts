import { describe, expect, it } from "vitest";
import {
  carRentalBreakdown,
  flightFareBreakdown,
  holidayPriceBreakdown,
  hotelStayBreakdown,
} from "@/lib/pricing";

describe("flightFareBreakdown", () => {
  it("splits the published fare into base and taxes per traveller", () => {
    const breakdown = flightFareBreakdown(3700, 2);

    expect(breakdown.base).toBe(6512);
    expect(breakdown.taxes).toBe(888);
    expect(breakdown.total).toBe(7400);
    expect(breakdown.base + breakdown.taxes).toBe(breakdown.total);
  });

  it("keeps the total equal to fare × travellers for odd fares", () => {
    for (const fare of [999, 3701, 12345]) {
      const breakdown = flightFareBreakdown(fare, 3);
      expect(breakdown.total).toBe(fare * 3);
      expect(breakdown.base + breakdown.taxes).toBe(breakdown.total);
    }
  });
});

describe("hotelStayBreakdown", () => {
  it("multiplies nights and rooms before tax", () => {
    const breakdown = hotelStayBreakdown(18500, 4, 1, 18);

    expect(breakdown.base).toBe(74000);
    expect(breakdown.taxes).toBe(13320);
    expect(breakdown.total).toBe(87320);
    expect(breakdown.perNight).toBe(18500);
  });

  it("scales by room count", () => {
    const single = hotelStayBreakdown(10000, 2, 1, 10);
    const double = hotelStayBreakdown(10000, 2, 2, 10);

    expect(double.base).toBe(single.base * 2);
    expect(double.total).toBe(single.total * 2);
  });
});

describe("holidayPriceBreakdown", () => {
  it("applies the demo 5% tax to the per-person subtotal", () => {
    const breakdown = holidayPriceBreakdown(24500, 3);

    expect(breakdown.base).toBe(73500);
    expect(breakdown.taxes).toBe(3675);
    expect(breakdown.total).toBe(77175);
    expect(breakdown.perPerson).toBe(24500);
    expect(breakdown.travellers).toBe(3);
  });

  it("accepts a custom tax rate", () => {
    const breakdown = holidayPriceBreakdown(1000, 2, 0);
    expect(breakdown.taxes).toBe(0);
    expect(breakdown.total).toBe(2000);
  });
});

describe("carRentalBreakdown", () => {
  it("bills short rentals at the daily rate", () => {
    const breakdown = carRentalBreakdown(
      { price_per_day: 5256, price_per_week: 36792 },
      {
        days: 2,
        kmPlanExtraPerDay: 0,
        delivery: false,
        deliveryFee: 499,
        addons: [],
        deposit: 4000,
      },
    );

    expect(breakdown.perDay).toBe(5256);
    expect(breakdown.base).toBe(10512);
    expect(breakdown.taxes).toBe(1892);
    expect(breakdown.total).toBe(12404);
    expect(breakdown.deposit).toBe(4000);
    expect(breakdown.base + breakdown.taxes).toBe(breakdown.total);
  });

  it("adds the kilometre plan, delivery, and extras before GST", () => {
    const breakdown = carRentalBreakdown(
      { price_per_day: 5256, price_per_week: 36792 },
      {
        days: 2,
        kmPlanExtraPerDay: 399,
        delivery: true,
        deliveryFee: 499,
        addons: [
          { price: 199, perDay: true },
          { price: 149, perDay: false },
        ],
        deposit: 4000,
      },
    );

    expect(breakdown.kmFee).toBe(798);
    expect(breakdown.deliveryFee).toBe(499);
    expect(breakdown.addonFee).toBe(547);
    expect(breakdown.taxes).toBe(2224);
    expect(breakdown.total).toBe(14580);
  });

  it("ignores delivery when it is not selected and never bills below one day", () => {
    const breakdown = carRentalBreakdown(
      { price_per_day: 3576, price_per_week: 25032 },
      {
        days: 0,
        kmPlanExtraPerDay: 0,
        delivery: false,
        deliveryFee: 299,
        addons: [],
      },
    );

    expect(breakdown.days).toBe(1);
    expect(breakdown.base).toBe(3576);
    expect(breakdown.deliveryFee).toBe(0);
    expect(breakdown.deposit).toBe(0);
  });

  it.each([
    [6, 0, 6, 12000],
    [7, 1, 0, 12000],
    [8, 1, 1, 14000],
    [14, 2, 0, 24000],
    [16, 2, 2, 28000],
    [7.25, 1, 1, 14000],
  ])("bills %s days as %s weeks and %s daily blocks", (days, weeks, remainingDays, base) => {
    const breakdown = carRentalBreakdown(
      { price_per_day: 2000, price_per_week: 12000 },
      {
        days,
        kmPlanExtraPerDay: 399,
        delivery: true,
        deliveryFee: 499,
        addons: [
          { price: 199, perDay: true },
          { price: 149, perDay: false },
        ],
        deposit: 3000,
      },
    );
    const billedDays = Math.ceil(days);
    expect(breakdown).toMatchObject({
      weeks,
      remainingDays,
      base,
      days: billedDays,
      deposit: 3000,
    });
    expect(breakdown.kmFee).toBe(399 * billedDays);
    expect(breakdown.addonFee).toBe(199 * billedDays + 149);
    const subtotal = base + breakdown.kmFee + breakdown.addonFee + 499;
    expect(breakdown.total).toBe(subtotal + Math.round(subtotal * 0.18));
  });
});
