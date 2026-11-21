import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mongodb", () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import { getEventBySlug, getEvents } from "@/lib/data/events";
import { eventSchema } from "@/lib/data/schemas";
import { EventModel } from "@/lib/models/event";

describe("event catalogue data", () => {
  const execute = vi.fn();
  beforeEach(() => {
    vi.restoreAllMocks();
    execute.mockReset();
    vi.spyOn(EventModel, "find").mockReturnValue({
      sort: () => ({ lean: () => ({ exec: execute }) }),
    } as unknown as ReturnType<typeof EventModel.find>);
  });

  it("reads events fresh on every call without fixture fallbacks or a process cache", async () => {
    execute.mockResolvedValue([]);
    expect(await getEvents()).toEqual([]);
    expect(await getEventBySlug("missing")).toBeUndefined();
    expect(EventModel.find).toHaveBeenCalledTimes(2);
    expect(EventModel.find).toHaveBeenCalledWith(
      {},
      {
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        sort_order: 0,
      },
    );
  });

  it("resolves event slugs rather than record IDs", async () => {
    const event = eventSchema.parse({
      id: "event-test",
      slug: "test-event",
      title: "Test event",
      category: "culture",
      summary: "Test summary",
      description: "Test description",
      venue: "Test venue",
      area: "Panaji",
      image: "/test.jpg",
    });
    execute.mockResolvedValue([event]);
    expect(await getEventBySlug("test-event")).toEqual(event);
    expect(await getEventBySlug("event-test")).toBeUndefined();
  });

  it("keeps event IDs and slugs unique in MongoDB and fixes the state to Goa", async () => {
    expect(EventModel.schema.path("id").options.unique).toBe(true);
    expect(EventModel.schema.path("slug").options.unique).toBe(true);
    const record = new EventModel({
      id: "test",
      slug: "test",
      title: "Test",
      category: "music",
      summary: "Summary",
      description: "Description",
      venue: "Venue",
      area: "Area",
      image: "/test.jpg",
      sort_order: 0,
    });
    await expect(record.validate()).resolves.toBeUndefined();
    expect(record.location).toBe("Goa");
    record.location = "Kerala" as "Goa";
    await expect(record.validate()).rejects.toThrow();
  });
});
