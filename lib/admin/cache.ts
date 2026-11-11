import { revalidatePath } from "next/cache";
import { clearCollectionCache } from "@/lib/data/mongo";

/**
 * Public routes that render catalogue documents. A layout-level revalidation
 * also clears nested detail pages, so an edited hotel appears on /hotels and
 * /hotels/[id] without waiting for the next full build.
 */
const CATALOGUE_PATHS = ["/", "/hotels", "/holidays", "/rent-a-car", "/offers"] as const;

export function invalidateCatalogueCache(modelName?: string): void {
  clearCollectionCache(modelName);

  for (const path of CATALOGUE_PATHS) {
    revalidatePath(path, path === "/" ? "page" : "layout");
  }
}
