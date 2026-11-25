import { describe, expect, it } from "vitest";
import { migratedCarRates, needsCarRateMigration } from "../scripts/lib/car-rate-migration";

describe("car rate migration", () => {
  it("converts the legacy Magnite rate", () => {
    expect(migratedCarRates({ price_per_hour: 349 })).toEqual({
      price_per_day: 8376,
      price_per_week: 58632,
    });
  });

  it("preserves explicitly edited daily and weekly rates", () => {
    expect(
      migratedCarRates({
        price_per_hour: 349,
        price_per_day: 2000,
        price_per_week: 12000,
      }),
    ).toEqual({ price_per_day: 2000, price_per_week: 12000 });
  });

  it("uses an existing daily rate for a missing weekly rate", () => {
    expect(migratedCarRates({ price_per_day: 2000 })).toEqual({
      price_per_day: 2000,
      price_per_week: 14000,
    });
  });

  it("is idempotent once the hourly field is removed", () => {
    const rates = migratedCarRates({ price_per_hour: 349 });
    expect(needsCarRateMigration(rates)).toBe(false);
    expect(migratedCarRates(rates)).toEqual(rates);
    expect(needsCarRateMigration({ ...rates, price_per_hour: 349 })).toBe(true);
  });

  it.each([0, -1, NaN, Infinity, "349", undefined, Number.MAX_SAFE_INTEGER])(
    "rejects an invalid legacy rate (%s)",
    (price_per_hour) => {
      expect(() => migratedCarRates({ price_per_hour })).toThrow();
    },
  );

  it("does not replace explicitly invalid rates with computed ones", () => {
    expect(() => migratedCarRates({ price_per_hour: 349, price_per_day: 0 })).toThrow();
    expect(() => migratedCarRates({ price_per_day: 2000, price_per_week: -1 })).toThrow();
  });
});
