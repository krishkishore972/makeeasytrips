import { beforeEach, describe, expect, it, vi } from "vitest";
import { eventSchema } from "@/lib/data/schemas";
import { EVENT_CATEGORIES, EVENT_CATEGORY_OPTIONS } from "@/lib/event-options";
import {
  CATALOGUE_META,
  CATALOGUE_UNIQUE_FIELDS,
  catalogueFields,
} from "@/lib/admin/catalogue-config";
import { parseCatalogueForm } from "@/lib/admin/catalogue-form";
import { summariseCatalogueRecord } from "@/lib/admin/catalogue-summary";
import { catalogueImageId } from "@/lib/admin/catalogue-images";
import { cloudinaryFolder, isUploadFolder } from "@/lib/admin/uploads";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  record: vi.fn(),
  inUse: vi.fn(),
  write: vi.fn(),
  sortOrder: vi.fn(),
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
  catalogueFieldInUse: mocks.inUse,
  nextCatalogueSortOrder: mocks.sortOrder,
  writeCatalogueRecord: mocks.write,
  allOtherCatalogueImages: mocks.other,
  deleteCatalogueRecord: mocks.remove,
  catalogueModelName: () => "Event",
}));
vi.mock("@/lib/admin/cloudinary", () => ({
  getCloudinaryCredentials: () => ({ cloudName: "demo" }),
  destroyCatalogueImage: mocks.destroy,
}));
import { saveCatalogueAction } from "@/lib/admin/catalogue-actions";
import { deleteCatalogueAction } from "@/lib/admin/catalogue-delete";

const image = "https://res.cloudinary.com/demo/image/upload/v1/tripnest/events/test-event.jpg";
const event = {
  id: "event-test",
  slug: "test-event",
  title: "Test event",
  category: "music",
  summary: "Test summary",
  description: "Test description",
  venue: "Test venue",
  area: "Panaji",
  image,
};

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...event, _resource: "events", ...overrides })) {
    data.set(key, value);
  }
  return data;
}

describe("events catalogue contract", () => {
  it("uses the agreed categories and safe defaults without invented event content", () => {
    expect(EVENT_CATEGORIES).toEqual([
      "music",
      "nightlife",
      "celebrations",
      "corporate",
      "weddings",
      "culture",
    ]);
    expect(EVENT_CATEGORY_OPTIONS.map(({ value }) => value)).toEqual(EVENT_CATEGORIES);
    expect(eventSchema.parse(event)).toMatchObject({
      location: "Goa",
      event_date: "",
      start_time: "",
      price_label: "Get a custom quote",
      gallery: [],
      highlights: [],
      featured: false,
    });
    expect(eventSchema.safeParse({ ...event, location: "Kerala" }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, event_date: "2027-02-30" }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, start_time: "25:10" }).success).toBe(false);
  });

  it("normalises create fields, ignores submitted state and supports flexible dates", () => {
    const result = parseCatalogueForm(
      "events",
      form({
        id: "Event TEST!",
        slug: "Test Event",
        location: "Kerala",
        highlights: "First\nSecond",
      }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      id: "event-test",
      slug: "test-event",
      location: "Goa",
      event_date: "",
      start_time: "",
      price_label: "Get a custom quote",
      highlights: ["First", "Second"],
    });
    expect(catalogueFields("events").some(({ name }) => name === "location")).toBe(false);
  });

  it("supports editing with a fixed id and rejects invalid required fields and excess photos", () => {
    const result = parseCatalogueForm(
      "events",
      form({
        id: "tampered",
        event_date: "2027-03-14",
        start_time: "18:30",
        price_label: "On request",
      }),
      { fixedId: "event-existing" },
    );
    expect(result.success && result.data.id).toBe("event-existing");
    const invalidFields: Record<string, string>[] = [
      { image: "" },
      { category: "invalid" },
      { title: "" },
      { start_time: "24:00" },
    ];
    for (const overrides of invalidFields) {
      expect(parseCatalogueForm("events", form(overrides)).success).toBe(false);
    }
    expect(
      parseCatalogueForm(
        "events",
        form({
          gallery: Array.from({ length: 5 }, (_, i) => `/photo-${i}.jpg`).join("\n"),
        }),
      ).success,
    ).toBe(false);
  });

  it("uses event upload IDs, slug uniqueness and slug-based public links", () => {
    expect(isUploadFolder("events")).toBe(true);
    expect(cloudinaryFolder("events")).toBe("tripnest/events");
    expect(catalogueImageId(image, "demo")).toBe("tripnest/events/test-event");
    expect(CATALOGUE_META.events.uploadFolder).toBe("events");
    expect(CATALOGUE_UNIQUE_FIELDS.events).toEqual(["slug"]);
    expect(summariseCatalogueRecord("events", event)).toMatchObject({
      publicHref: "/events/test-event",
      editHref: "/admin/events/event-test",
      subtitle: "Test venue · Panaji · Goa",
    });
  });
});

describe("authenticated events CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ email: "admin@example.com" });
    mocks.record.mockResolvedValue(null);
    mocks.inUse.mockResolvedValue(false);
    mocks.sortOrder.mockResolvedValue(3);
    mocks.other.mockResolvedValue([]);
    mocks.remove.mockResolvedValue(true);
  });

  it("creates an event, checks slug uniqueness and invalidates Event cache", async () => {
    await saveCatalogueAction({}, form());
    expect(mocks.session).toHaveBeenCalled();
    expect(mocks.inUse).toHaveBeenCalledWith("events", "slug", "test-event", undefined);
    expect(mocks.write).toHaveBeenCalledWith(
      "events",
      expect.objectContaining({
        location: "Goa",
        price_label: "Get a custom quote",
      }),
      { existingId: undefined, sortOrder: 3 },
    );
    expect(mocks.invalidate).toHaveBeenCalledWith("Event");
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/events?saved=event-test&mode=created");
  });

  it("edits an event without changing its identity or sort order", async () => {
    mocks.record.mockResolvedValue({ ...event, sort_order: 7 });
    await saveCatalogueAction({}, form({ _recordId: event.id, id: "tampered", title: "Updated" }));
    expect(mocks.write).toHaveBeenCalledWith(
      "events",
      expect.objectContaining({
        id: event.id,
        title: "Updated",
      }),
      { existingId: event.id, sortOrder: 7 },
    );
    expect(mocks.inUse).toHaveBeenCalledWith("events", "slug", event.slug, event.id);
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/events?saved=event-test&mode=updated");
  });

  it("reports a duplicate slug instead of writing", async () => {
    mocks.inUse.mockImplementation(async (_resource, field) => field === "slug");
    const result = await saveCatalogueAction({}, form());
    expect(result.fieldErrors?.slug).toContain("already in use");
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it("deletes event images and the event through the generic action", async () => {
    mocks.record.mockResolvedValue(event);
    const data = new FormData();
    data.set("resource", "events");
    data.set("id", event.id);
    await deleteCatalogueAction({}, data);
    expect(mocks.destroy).toHaveBeenCalledWith("tripnest/events/test-event");
    expect(mocks.remove).toHaveBeenCalledWith("events", event.id);
    expect(mocks.invalidate).toHaveBeenCalledWith("Event");
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/events?deleted=event-test");
  });

  it("requires authentication before reading or writing", async () => {
    mocks.session.mockRejectedValue(new Error("unauthorized"));
    await expect(saveCatalogueAction({}, form())).rejects.toThrow("unauthorized");
    await expect(deleteCatalogueAction({}, form())).rejects.toThrow("unauthorized");
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.write).not.toHaveBeenCalled();
  });
});
