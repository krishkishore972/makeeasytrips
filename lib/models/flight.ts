import { Schema, model, models, type Model } from "mongoose";
import type { Flight } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";

const clockTime = /^\d{2}:\d{2}$/;

const flightSchema = new Schema<Ordered<Flight>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    airline: { type: String, required: true, trim: true },
    airline_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    flight_number: { type: String, required: true, trim: true },
    from_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    to_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    depart_time: { type: String, required: true, match: clockTime },
    arrive_time: { type: String, required: true, match: clockTime },
    arrive_day_offset: { type: Number, required: true, min: 0, max: 1 },
    duration_minutes: { type: Number, required: true, min: 1 },
    stops: { type: Number, required: true, min: 0, max: 2 },
    via: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    aircraft: { type: String, required: true, trim: true },
    fare_economy: { type: Number, required: true, min: 1 },
    fare_premium: { type: Number, required: true, min: 1 },
    fare_business: { type: Number, required: true, min: 1 },
    refundable: { type: Boolean, required: true, default: false },
    fare_brand: { type: String, required: true, enum: ["Saver", "Flex"] },
    baggage_checkin: { type: Number, required: true, min: 1 },
    baggage_cabin: { type: Number, required: true, min: 1 },
    meal_included: { type: Boolean, required: true, default: false },
    on_time: { type: Number, required: true, min: 0, max: 100 },
    seats_left: { type: Number, required: true, min: 0 },
    carbon_kg: { type: Number, required: true, min: 0 },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "flights",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

flightSchema.index({ from_code: 1, to_code: 1, depart_time: 1 });
flightSchema.index({ airline_code: 1 });
flightSchema.index({ sort_order: 1 });

export const FlightModel: Model<Ordered<Flight>> =
  (models.Flight as Model<Ordered<Flight>> | undefined) ??
  model<Ordered<Flight>>("Flight", flightSchema);
