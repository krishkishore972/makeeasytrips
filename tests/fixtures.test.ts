import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  carSchema,
  citySchema,
  flightSchema,
  holidaySchema,
  hotelSchema,
  offerSchema,
} from "@/lib/data/schemas";

const dataDir = fileURLToPath(new URL("../data", import.meta.url));

const fixtures = [
  ["cities.json", citySchema],
  ["flights.json", flightSchema],
  ["hotels.json", hotelSchema],
  ["cars.json", carSchema],
  ["holidays.json", holidaySchema],
  ["offers.json", offerSchema],
] as const;

describe("seed fixtures", () => {
  it.each(fixtures)("validates every row in %s", (fileName, schema) => {
    const rows: unknown = JSON.parse(readFileSync(path.join(dataDir, fileName), "utf8"));
    const result = schema.array().safeParse(rows);

    if (!result.success) {
      const issues = result.error.issues
        .slice(0, 5)
        .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
        .join("; ");
      expect.fail(`Invalid ${fileName} — ${issues}`);
    }

    expect(result.data.length).toBeGreaterThan(0);
  });
});
