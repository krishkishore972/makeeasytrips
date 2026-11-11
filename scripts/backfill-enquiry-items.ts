import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { getCars } from "@/lib/data/cars";
import { getFlights } from "@/lib/data/flights";
import { getHolidays } from "@/lib/data/holidays";
import { getHotels } from "@/lib/data/hotels";
import type { EnquiryService } from "@/lib/enquiry";
import { EnquiryModel } from "@/lib/models/enquiry";
import dbConnect from "@/lib/mongodb";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    loadEnvFile(file);
  }
}

type ItemMatch = {
  itemId: string;
  itemHref: string;
};

type PendingEnquiry = {
  _id: unknown;
  service: EnquiryService;
  title: string;
  itemId?: string;
  itemHref?: string;
  status?: string;
};

/**
 * Build a title -> item map and drop ambiguous titles. Historical enquiries
 * stored only the display title, so a unique match is the only safe link.
 */
function uniqueMatches(entries: Array<[string, ItemMatch]>): Map<string, ItemMatch> {
  const matches = new Map<string, ItemMatch>();
  const ambiguous = new Set<string>();

  for (const [title, match] of entries) {
    if (matches.has(title)) {
      ambiguous.add(title);
      continue;
    }

    matches.set(title, match);
  }

  for (const title of ambiguous) {
    matches.delete(title);
  }

  return matches;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const connection = await dbConnect();

  console.log(`Connected to MongoDB: ${connection.connection.host}/${connection.connection.name}`);

  const [hotels, holidays, cars, flights] = await Promise.all([
    getHotels(),
    getHolidays(),
    getCars(),
    getFlights(),
  ]);

  const matchesByService: Record<EnquiryService, Map<string, ItemMatch>> = {
    hotel: uniqueMatches(
      hotels.map((hotel) => [hotel.name, { itemId: hotel.id, itemHref: `/hotels/${hotel.id}` }]),
    ),
    holiday: uniqueMatches(
      holidays.map((holiday) => [
        holiday.title,
        { itemId: holiday.id, itemHref: `/holidays/${holiday.slug}` },
      ]),
    ),
    car: uniqueMatches(
      cars.map((car) => [
        `${car.brand} ${car.model}`,
        { itemId: car.id, itemHref: `/rent-a-car/${car.id}` },
      ]),
    ),
    flight: uniqueMatches(
      flights.map((flight) => [
        `${flight.from_code} → ${flight.to_code} · ${flight.airline} ${flight.flight_number}`,
        { itemId: flight.id, itemHref: `/flights/${flight.id}` },
      ]),
    ),
  };

  const pending = await EnquiryModel.find({
    $or: [
      { itemId: { $exists: false } },
      { itemId: "" },
      { itemHref: { $exists: false } },
      { itemHref: "" },
    ],
  })
    .select({ service: 1, title: 1, itemId: 1, itemHref: 1, status: 1 })
    .lean<PendingEnquiry[]>()
    .exec();

  const updates: Array<{
    updateOne: { filter: { _id: unknown }; update: { $set: Record<string, string> } };
  }> = [];
  const unmatched: PendingEnquiry[] = [];
  const matchedByService: Record<EnquiryService, number> = {
    flight: 0,
    hotel: 0,
    holiday: 0,
    car: 0,
  };

  for (const enquiry of pending) {
    const match = matchesByService[enquiry.service]?.get(enquiry.title);

    if (!match) {
      unmatched.push(enquiry);
      continue;
    }

    const patch: Record<string, string> = {};

    if (!enquiry.itemId) patch.itemId = match.itemId;
    if (!enquiry.itemHref) patch.itemHref = match.itemHref;
    if (!enquiry.status) patch.status = "new";

    if (Object.keys(patch).length === 0) continue;

    matchedByService[enquiry.service] += 1;
    updates.push({ updateOne: { filter: { _id: enquiry._id }, update: { $set: patch } } });
  }

  const missingStatus = await EnquiryModel.countDocuments({ status: { $exists: false } }).exec();

  console.log(`Enquiries needing an item link: ${pending.length}`);
  console.log(
    `Matched: ${updates.length} (${Object.entries(matchedByService)
      .map(([service, count]) => `${service} ${count}`)
      .join(", ")})`,
  );
  console.log(`Unmatched: ${unmatched.length}`);
  console.log(`Enquiries missing status: ${missingStatus}`);

  for (const enquiry of unmatched.slice(0, 10)) {
    console.log(`  unmatched [${enquiry.service}] ${JSON.stringify(enquiry.title)}`);
  }

  if (dryRun) {
    console.log("Dry run: no documents were changed.");
    await connection.disconnect();
    return;
  }

  if (updates.length > 0) {
    const result = await EnquiryModel.bulkWrite(updates, { ordered: false });
    console.log(`Updated ${result.modifiedCount} enquiries.`);
  }

  const statusResult = await EnquiryModel.updateMany(
    { status: { $exists: false } },
    { $set: { status: "new" } },
  );
  console.log(`Filled status on ${statusResult.modifiedCount} enquiries.`);

  await connection.disconnect();
}

main().catch((error: unknown) => {
  console.error("Enquiry backfill failed:", error);
  process.exitCode = 1;
});
