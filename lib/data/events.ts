import { eventSchema, type GoaEvent } from "@/lib/data/schemas";
import { EventModel } from "@/lib/models/event";
import dbConnect from "@/lib/mongodb";

/** Event availability changes frequently; never retain it in a process cache. */
export async function getEvents(): Promise<GoaEvent[]> {
  await dbConnect();
  const documents = await EventModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0, sort_order: 0 })
    .sort({ sort_order: 1 })
    .lean<Record<string, unknown>[]>()
    .exec();

  return documents.map((document) => eventSchema.parse(document));
}

export async function getEventBySlug(slug: string): Promise<GoaEvent | undefined> {
  const events = await getEvents();
  return events.find((event) => event.slug === slug);
}
