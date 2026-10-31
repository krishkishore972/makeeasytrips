import { Schema, model, models, type Model } from "mongoose";
import type { Hotel } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";
import { PROPERTY_TYPES } from "@/lib/search-options";

const clockTime = /^\d{2}:\d{2}$/;

const hotelSchema = new Schema<Ordered<Hotel>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    city_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    area: { type: String, required: true, trim: true },
    property_type: { type: String, required: true, enum: PROPERTY_TYPES },
    star_rating: { type: Number, required: true, min: 1, max: 5 },
    guest_rating: { type: Number, required: true, min: 0, max: 10 },
    review_count: { type: Number, required: true, min: 0 },
    price_per_night: { type: Number, required: true, min: 1 },
    tax_percent: { type: Number, required: true, min: 0, max: 30 },
    image: { type: String, required: true, trim: true },
    amenities: { type: [String], required: true, default: [] },
    room_type: { type: String, required: true, trim: true },
    breakfast: { type: Boolean, required: true, default: false },
    free_cancellation: { type: Boolean, required: true, default: false },
    check_in: { type: String, required: true, match: clockTime },
    check_out: { type: String, required: true, match: clockTime },
    distance_km: { type: Number, required: true, min: 0 },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    featured: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "hotels",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

hotelSchema.index({ city_code: 1, price_per_night: 1 });
hotelSchema.index({ guest_rating: -1 });
hotelSchema.index({ featured: 1 });
hotelSchema.index({ sort_order: 1 });

export const HotelModel: Model<Ordered<Hotel>> =
  (models.Hotel as Model<Ordered<Hotel>> | undefined) ??
  model<Ordered<Hotel>>("Hotel", hotelSchema);
