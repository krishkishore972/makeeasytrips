import { describe, expect, it } from "vitest";
import { flightFareBreakdown, holidayPriceBreakdown, hotelStayBreakdown } from "@/lib/pricing";

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
