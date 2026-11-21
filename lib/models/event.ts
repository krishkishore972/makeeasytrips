import { Schema, model, models, type Model } from "mongoose";
import type { GoaEvent } from "@/lib/data/schemas";
import { EVENT_CATEGORIES } from "@/lib/event-options";
import type { Ordered } from "@/lib/models/ordered";

const eventSchema = new Schema<Ordered<GoaEvent>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: EVENT_CATEGORIES },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    location: { type: String, required: true, enum: ["Goa"], default: "Goa" },
    event_date: { type: String, default: "", match: /^(?:|\d{4}-\d{2}-\d{2})$/ },
    start_time: { type: String, default: "", match: /^(?:|(?:[01]\d|2[0-3]):[0-5]\d)$/ },
    price_label: { type: String, required: true, trim: true, default: "Get a custom quote" },
    image: { type: String, required: true, trim: true },
    gallery: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    featured: { type: Boolean, required: true, default: false },
    show_in_banner: { type: Boolean, required: true, default: true },
    sort_order: { type: Number, required: true, min: 0 },
  },
  { collection: "events", timestamps: true, id: false, versionKey: false },
);

eventSchema.index({ sort_order: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ featured: 1 });

export const EventModel: Model<Ordered<GoaEvent>> =
  (models.Event as Model<Ordered<GoaEvent>> | undefined) ??
  model<Ordered<GoaEvent>>("Event", eventSchema);
