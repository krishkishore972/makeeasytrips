import { Schema, model, models, type Model } from "mongoose";
import type { Holiday, HolidayDay } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";
import { holidayThemeValues } from "@/lib/search-options";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const holidayDaySchema = new Schema<HolidayDay>(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const holidaySchema = new Schema<Ordered<Holiday>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[a-z0-9-]+$/,
    },
    title: { type: String, required: true, trim: true },
    city_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    country: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 2, max: 15 },
    nights: { type: Number, required: true, min: 1, max: 14 },
    price_per_person: { type: Number, required: true, min: 1 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    review_count: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    gallery: { type: [String], required: true, default: [] },
    themes: { type: [String], required: true, enum: holidayThemeValues, default: [] },
    summary: { type: String, required: true, trim: true },
    highlights: { type: [String], required: true, default: [] },
    inclusions: { type: [String], required: true, default: [] },
    exclusions: { type: [String], required: true, default: [] },
    itinerary: { type: [holidayDaySchema], required: true, default: [] },
    departure_dates: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (dates: string[]) => dates.every((date) => isoDate.test(date)),
        message: "Every departure date must use YYYY-MM-DD",
      },
    },
    featured: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "holidays",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

holidaySchema.index({ city_code: 1, price_per_person: 1 });
holidaySchema.index({ themes: 1 });
holidaySchema.index({ rating: -1 });
holidaySchema.index({ featured: 1 });
holidaySchema.index({ sort_order: 1 });

export const HolidayModel: Model<Ordered<Holiday>> =
  (models.Holiday as Model<Ordered<Holiday>> | undefined) ??
  model<Ordered<Holiday>>("Holiday", holidaySchema);
