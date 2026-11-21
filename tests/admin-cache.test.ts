import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/data/mongo", () => ({ clearCollectionCache: vi.fn() }));

import { revalidatePath } from "next/cache";
import { clearCollectionCache } from "@/lib/data/mongo";
import { invalidateCatalogueCache } from "@/lib/admin/cache";

describe("catalogue cache invalidation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refreshes admin list and edit pages as well as public catalogue pages", () => {
    invalidateCatalogueCache("Holiday");

    expect(clearCollectionCache).toHaveBeenCalledWith("Holiday");
    expect(revalidatePath).toHaveBeenCalledWith("/admin", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/", "page");
    for (const path of ["/hotels", "/holidays", "/rent-a-car", "/offers", "/events"]) {
      expect(revalidatePath).toHaveBeenCalledWith(path, "layout");
    }
  });
});
