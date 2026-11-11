import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  record: vi.fn(),
  other: vi.fn(),
  remove: vi.fn(),
  destroy: vi.fn(),
  invalidate: vi.fn(),
  audit: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/admin/session", () => ({ requireAdminSession: mocks.session }));
vi.mock("@/lib/admin/audit", () => ({
  requestAuditContext: () => ({ ip: "test" }),
  recordAuditEvent: mocks.audit,
}));
vi.mock("@/lib/admin/cache", () => ({ invalidateCatalogueCache: mocks.invalidate }));
vi.mock("@/lib/admin/catalogue-data", () => ({
  getCatalogueRecord: mocks.record,
  allOtherCatalogueImages: mocks.other,
  deleteCatalogueRecord: mocks.remove,
  catalogueModelName: () => "Hotel",
}));
vi.mock("@/lib/admin/cloudinary", () => ({
  getCloudinaryCredentials: () => ({ cloudName: "demo" }),
  destroyCatalogueImage: mocks.destroy,
}));
import { deleteCatalogueAction } from "@/lib/admin/catalogue-delete";

const url = (id: string) =>
  `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/tripnest/hotels/${id}`;
function form() {
  const data = new FormData();
  data.set("resource", "hotels");
  data.set("id", "test-hotel");
  return data;
}

describe("delete catalogue action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ email: "admin@example.com" });
    mocks.record.mockResolvedValue({ image: url("main"), gallery: [url("extra"), url("shared")] });
    mocks.other.mockResolvedValue([url("shared")]);
    mocks.destroy.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(true);
  });
  it("authenticates, deletes unshared photos, deletes the listing and invalidates the cache", async () => {
    await deleteCatalogueAction({}, form());
    expect(mocks.session).toHaveBeenCalled();
    expect(mocks.destroy.mock.calls.map(([id]) => id)).toEqual([
      "tripnest/hotels/main",
      "tripnest/hotels/extra",
    ]);
    expect(mocks.remove).toHaveBeenCalledWith("hotels", "test-hotel");
    expect(mocks.invalidate).toHaveBeenCalledWith("Hotel");
    expect(mocks.redirect).toHaveBeenCalled();
  });
  it("retains the listing and reports an error if Cloudinary fails", async () => {
    mocks.destroy.mockRejectedValue(new Error("failure"));
    const result = await deleteCatalogueAction({}, form());
    expect(result.error).toContain("Deletion failed");
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("does not read or delete data when authentication fails", async () => {
    mocks.session.mockRejectedValue(new Error("unauthorized"));
    await expect(deleteCatalogueAction({}, form())).rejects.toThrow("unauthorized");
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
