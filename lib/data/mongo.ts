import type { Model } from "mongoose";
import type { ZodType } from "zod";
import type { Ordered } from "@/lib/models/ordered";
import dbConnect from "@/lib/mongodb";

type CatalogueCache = Map<string, Promise<unknown>>;

/**
 * Next can evaluate this module once per server bundle (pages, route handlers,
 * server actions). A module-level Map would then produce one cache per bundle,
 * so an admin save would clear the action's copy while the public route kept a
 * stale one. Storing the Map on globalThis gives the whole server process a
 * single cache.
 */
const globalCache = globalThis as typeof globalThis & {
  __tripnestCatalogueCache?: CatalogueCache;
};

const cache: CatalogueCache =
  globalCache.__tripnestCatalogueCache ?? new Map<string, Promise<unknown>>();

globalCache.__tripnestCatalogueCache = cache;

const projection = {
  _id: 0,
  createdAt: 0,
  updatedAt: 0,
  sort_order: 0,
} as const;

async function fetchCollection<T extends object>(
  model: Model<Ordered<T>>,
  schema: ZodType<T>,
): Promise<T[]> {
  await dbConnect();

  const docs = await model
    .find({}, projection)
    .sort({ sort_order: 1 })
    .lean<Record<string, unknown>[]>()
    .exec();

  return docs.map((doc, index) => {
    const result = schema.safeParse(doc);

    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `${issue.path.join(".") || "document"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid ${model.modelName} document ${index + 1} — ${issues}`);
    }

    return result.data;
  });
}

/**
 * Load a whole catalogue collection once per server process, then reuse the
 * typed result. The promise is cached (not just the value) so concurrent
 * requests share one database read, matching the old CSV loader's behaviour.
 */
export function readCollection<T extends object>(
  model: Model<Ordered<T>>,
  schema: ZodType<T>,
): Promise<T[]> {
  const key = model.modelName;
  const cached = cache.get(key);
  if (cached) return cached as Promise<T[]>;

  const promise = fetchCollection(model, schema);
  cache.set(key, promise);

  promise.catch(() => {
    // A failed read should not poison the cache for later requests.
    if (cache.get(key) === promise) cache.delete(key);
  });

  return promise;
}

/**
 * Drop one catalogue collection from the process cache, or every collection
 * when no model name is supplied. Admin mutations call this before revalidating
 * the public routes so the next request reads the new MongoDB document.
 */
export function clearCollectionCache(modelName?: string): void {
  if (modelName) {
    cache.delete(modelName);
    return;
  }

  cache.clear();
}
