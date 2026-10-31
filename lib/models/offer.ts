import { Schema, model, models, type Model } from "mongoose";
import type { Offer } from "@/lib/data/schemas";
import type { Ordered } from "@/lib/models/ordered";
import { offerIconValues, offerServiceValues, offerToneValues } from "@/lib/search-options";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const offerSchema = new Schema<Ordered<Offer>>(
  {
    id: { type: String, required: true, trim: true, unique: true },
    category: { type: String, required: true, enum: offerServiceValues },
    eyebrow: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      match: /^[A-Z0-9]{4,16}$/,
    },
    discount_label: { type: String, required: true, trim: true },
    icon: { type: String, required: true, enum: offerIconValues },
    tone: { type: String, required: true, enum: offerToneValues },
    cta_label: { type: String, required: true, trim: true },
    cta_href: { type: String, required: true, trim: true },
    valid_until: { type: String, required: true, match: isoDate },
    terms: { type: String, required: true, trim: true },
    featured: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, required: true, min: 0 },
  },
  {
    collection: "offers",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

offerSchema.index({ category: 1, valid_until: 1 });
offerSchema.index({ featured: 1 });
offerSchema.index({ sort_order: 1 });

export const OfferModel: Model<Ordered<Offer>> =
  (models.Offer as Model<Ordered<Offer>> | undefined) ??
  model<Ordered<Offer>>("Offer", offerSchema);
