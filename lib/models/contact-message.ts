import { Schema, model, models, type Model } from "mongoose";
import type { ContactSubmission } from "@/lib/validation/forms";

/**
 * Messages from the contact page. Phone is optional because email is the
 * required reply channel.
 */
const contactMessageSchema = new Schema<ContactSubmission>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: { type: String, trim: true, maxlength: 20 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  {
    collection: "contact_messages",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessageModel: Model<ContactSubmission> =
  (models.ContactMessage as Model<ContactSubmission> | undefined) ??
  model<ContactSubmission>("ContactMessage", contactMessageSchema);
