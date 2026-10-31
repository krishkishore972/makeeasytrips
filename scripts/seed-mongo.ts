import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvFile } from "node:process";
import type { Model, QueryFilter } from "mongoose";
import { z, type ZodType } from "zod";
import {
  carSchema,
  citySchema,
  flightSchema,
  holidaySchema,
  hotelSchema,
  offerSchema,
} from "@/lib/data/schemas";
import {
  CarModel,
  CityModel,
  FlightModel,
  HolidayModel,
  HotelModel,
  OfferModel,
} from "@/lib/models";
import type { Ordered } from "@/lib/models/ordered";
import dbConnect from "@/lib/mongodb";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    loadEnvFile(file);
  }
}

const BATCH_SIZE = 50;

async function loadFixture<T>(fileName: string, schema: ZodType<T>): Promise<T[]> {
  const source = await readFile(path.join(process.cwd(), "data", fileName), "utf8");
  const parsed: unknown = JSON.parse(source);
  const result = z.array(schema).safeParse(parsed);

  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid fixture data/${fileName} — ${issues}`);
  }

  return result.data;
}

async function seedCollection<T extends object>(
  label: string,
  model: Model<Ordered<T>>,
  docs: T[],
  key: keyof T & string,
  fresh: boolean,
) {
  if (fresh) {
    await model.deleteMany({});
  }

  let inserted = 0;
  let updated = 0;

  for (let index = 0; index < docs.length; index += BATCH_SIZE) {
    const batch = docs.slice(index, index + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((doc, batchIndex) =>
        model.updateOne(
          { [key]: (doc as Record<string, unknown>)[key] } as QueryFilter<Ordered<T>>,
          { $set: { ...doc, sort_order: index + batchIndex } },
          { upsert: true },
        ),
      ),
    );

    for (const result of results) {
      if (result.upsertedCount > 0) {
        inserted += 1;
      } else {
        updated += 1;
      }
    }
  }

  console.log(
    `${label.padEnd(10)} ${String(docs.length).padStart(4)} rows (${inserted} inserted, ${updated} updated)`,
  );
}

async function main() {
  const fresh = process.argv.includes("--fresh");
  const connection = await dbConnect();

  console.log(`Connected to MongoDB: ${connection.connection.host}/${connection.connection.name}`);

  const [cities, flights, hotels, cars, holidays, offers] = await Promise.all([
    loadFixture("cities.json", citySchema),
    loadFixture("flights.json", flightSchema),
    loadFixture("hotels.json", hotelSchema),
    loadFixture("cars.json", carSchema),
    loadFixture("holidays.json", holidaySchema),
    loadFixture("offers.json", offerSchema),
  ]);

  await seedCollection("cities", CityModel, cities, "code", fresh);
  await seedCollection("flights", FlightModel, flights, "id", fresh);
  await seedCollection("hotels", HotelModel, hotels, "id", fresh);
  await seedCollection("cars", CarModel, cars, "id", fresh);
  await seedCollection("holidays", HolidayModel, holidays, "id", fresh);
  await seedCollection("offers", OfferModel, offers, "id", fresh);

  await Promise.all([
    CityModel.syncIndexes(),
    FlightModel.syncIndexes(),
    HotelModel.syncIndexes(),
    CarModel.syncIndexes(),
    HolidayModel.syncIndexes(),
    OfferModel.syncIndexes(),
  ]);

  console.log(fresh ? "Seed complete (collections replaced)." : "Seed complete (upserts applied).");

  await connection.disconnect();
}

main().catch((error: unknown) => {
  console.error("MongoDB seed failed:", error);
  process.exitCode = 1;
});
