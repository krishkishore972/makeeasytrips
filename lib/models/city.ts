import { Schema, model, models, type Model } from "mongoose";
import type { City } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";

const citySchema = new Schema<Ordered<City>>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    region: {
      type: String,
      required: true,
      enum: ["North", "South", "East", "West", "Central", "Northeast"],
    },
    airport: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    popular: { type: Boolean, required: true, default: false },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "cities",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

citySchema.index({ code: 1 }, { unique: true });
citySchema.index({ name: 1 });
citySchema.index({ sort_order: 1 });

export const CityModel: Model<Ordered<City>> =
  (models.City as Model<Ordered<City>> | undefined) ?? model<Ordered<City>>("City", citySchema);
