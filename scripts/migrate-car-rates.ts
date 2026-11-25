import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import type { mongo } from "mongoose";
import dbConnect from "@/lib/mongodb";
import {
  migratedCarRates,
  needsCarRateMigration,
  type CarRateRecord,
} from "./lib/car-rate-migration";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) loadEnvFile(file);
}

async function main() {
  const apply = process.argv.includes("--apply");
  if (apply && process.argv.includes("--dry-run")) {
    throw new Error("Choose either --apply or --dry-run, not both.");
  }

  const connection = await dbConnect();
  try {
    const database = connection.connection.db;
    if (!database) throw new Error("MongoDB connection has no database.");
    // Use the native collection so the removed schema field can be unset.
    const collection = database.collection<CarRateRecord>("cars");
    const records = await collection
      .find(
        {},
        {
          projection: { id: 1, price_per_hour: 1, price_per_day: 1, price_per_week: 1 },
        },
      )
      .toArray();

    // Validate the entire collection before making any changes.
    const pending = records
      .map((record) => ({
        record,
        rates: migratedCarRates(record),
      }))
      .filter(({ record }) => needsCarRateMigration(record));

    console.log(`Cars checked: ${records.length}`);
    console.log(`Cars needing migration: ${pending.length}`);
    console.log(`Already migrated: ${records.length - pending.length}`);
    for (const { record, rates } of pending.slice(0, 5)) {
      console.log(`${record.id}: ₹${rates.price_per_day}/day, ₹${rates.price_per_week}/week`);
    }

    if (!apply) {
      console.log("Dry run: no documents changed. Use --apply to migrate.");
      return;
    }

    if (pending.length > 0) {
      const directory = "/tmp/opencode";
      await mkdir(directory, { recursive: true });
      const backupPath = `${directory}/car-rates-backup-${Date.now()}.json`;
      await writeFile(
        backupPath,
        JSON.stringify(
          {
            createdAt: new Date().toISOString(),
            database: database.databaseName,
            collection: "cars",
            // Missing fields stay absent so the original pricing can be restored.
            records: pending.map(({ record }) => record),
          },
          null,
          2,
        ),
        { mode: 0o600, flag: "wx" },
      );
      console.log(`Original pricing backup: ${backupPath}`);

      const result = await collection.bulkWrite(
        pending.map(({ record, rates }) => {
          const filter: mongo.Filter<CarRateRecord> = { _id: record._id };
          // Do not overwrite pricing edited after the preview/backup read.
          for (const field of ["price_per_hour", "price_per_day", "price_per_week"] as const) {
            filter[field] = Object.hasOwn(record, field)
              ? { $eq: record[field], $exists: true }
              : { $exists: false };
          }
          return {
            updateOne: {
              filter,
              update: { $set: rates, $unset: { price_per_hour: "" } },
            },
          };
        }),
        { ordered: true },
      );
      console.log(`Cars migrated: ${result.modifiedCount}`);
      if (result.matchedCount !== pending.length) {
        throw new Error("Some pricing changed concurrently and was skipped. Rerun the migration.");
      }
    }

    const remaining = await collection.countDocuments({ price_per_hour: { $exists: true } });
    const finalRecords = await collection
      .find(
        {},
        {
          projection: { id: 1, price_per_day: 1, price_per_week: 1 },
        },
      )
      .toArray();
    for (const record of finalRecords) migratedCarRates(record);
    console.log(`Verified daily and weekly rates on ${finalRecords.length} cars.`);
    console.log(`Remaining hourly fields: ${remaining}`);
    if (remaining !== 0) throw new Error("Verification failed: hourly fields remain.");
  } finally {
    await connection.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Car rate migration failed:", error);
  process.exitCode = 1;
});
