import { Schema, model, models, type Model } from "mongoose";
import { enquiryServiceValues } from "@/lib/enquiry";
import type { EnquirySubmission } from "@/lib/validation/forms";

/**
 * One row per enquiry submitted from a service detail page. The WhatsApp
 * message is still the delivery channel; this collection is the durable copy
 * the team can follow up on if WhatsApp is missed.
 */
const enquirySchema = new Schema<EnquirySubmission>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    service: { type: String, required: true, enum: enquiryServiceValues },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    context: { type: [String], required: true, default: [] },
  },
  {
    collection: "enquiries",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ service: 1, createdAt: -1 });

export const EnquiryModel: Model<EnquirySubmission> =
  (models.Enquiry as Model<EnquirySubmission> | undefined) ??
  model<EnquirySubmission>("Enquiry", enquirySchema);
