import { vi } from "vitest";

/**
 * Tests exercise the catalogue search logic without needing a MongoDB server.
 * Every model maps to the same JSON fixture the seed script writes from.
 */
vi.mock("@/lib/data/mongo", async () => {
  const { readFileSync } = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");

  const dataDir = fileURLToPath(new URL("../../data", import.meta.url));
  const fixtures: Record<string, string> = {
    City: "cities.json",
    Flight: "flights.json",
    Hotel: "hotels.json",
    Car: "cars.json",
    Holiday: "holidays.json",
    Offer: "offers.json",
  };

  const load = (modelName: string) => {
    const fileName = fixtures[modelName];
    if (!fileName) throw new Error(`No test fixture mapped for model ${modelName}`);
    return JSON.parse(readFileSync(path.join(dataDir, fileName), "utf8")) as unknown[];
  };

  return {
    readCollection: vi.fn(async (model: { modelName: string }) => load(model.modelName)),
  };
});
