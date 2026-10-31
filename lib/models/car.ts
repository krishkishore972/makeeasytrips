import { Schema, model, models, type Model } from "mongoose";
import type { Car } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";
import { carFuelValues, carTransmissionValues, carTypeValues } from "@/lib/search-options";

const carSchema = new Schema<Ordered<Car>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 2015, max: 2030 },
    city_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    car_type: { type: String, required: true, enum: carTypeValues },
    transmission: { type: String, required: true, enum: carTransmissionValues },
    fuel: { type: String, required: true, enum: carFuelValues },
    seats: { type: Number, required: true, min: 2, max: 9 },
    price_per_hour: { type: Number, required: true, min: 1 },
    km_limit_per_day: { type: Number, required: true, min: 1 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    review_count: { type: Number, required: true, min: 0 },
    distance_km: { type: Number, required: true, min: 0 },
    host_name: { type: String, required: true, trim: true },
    host_type: { type: String, required: true, enum: ["Professional", "Individual"] },
    fastag: { type: Boolean, required: true, default: false },
    home_delivery: { type: Boolean, required: true, default: false },
    delivery_fee: { type: Number, required: true, min: 0 },
    deposit: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    featured: { type: Boolean, required: true, default: false },
    guest_favorite: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "cars",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

carSchema.index({ city_code: 1, price_per_hour: 1 });
carSchema.index({ car_type: 1 });
carSchema.index({ rating: -1 });
carSchema.index({ featured: 1 });
carSchema.index({ sort_order: 1 });

export const CarModel: Model<Ordered<Car>> =
  (models.Car as Model<Ordered<Car>> | undefined) ?? model<Ordered<Car>>("Car", carSchema);
