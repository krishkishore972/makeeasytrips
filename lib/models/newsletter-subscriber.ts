import { Schema, model, models, type Model } from "mongoose";
import type { NewsletterSubmission } from "@/lib/validation/forms";

type NewsletterSubscriberRecord = NewsletterSubmission & {
  source: string;
};

/**
 * Footer newsletter opt-ins. The email is the natural key, so re-submitting the
 * same address is idempotent instead of creating duplicate rows.
 */
const newsletterSubscriberSchema = new Schema<NewsletterSubscriberRecord>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    source: { type: String, required: true, trim: true, default: "footer" },
  },
  {
    collection: "newsletter_subscribers",
    timestamps: true,
    id: false,
    versionKey: false,
  },
);

newsletterSubscriberSchema.index({ createdAt: -1 });

export const NewsletterSubscriberModel: Model<NewsletterSubscriberRecord> =
  (models.NewsletterSubscriber as Model<NewsletterSubscriberRecord> | undefined) ??
  model<NewsletterSubscriberRecord>("NewsletterSubscriber", newsletterSubscriberSchema);
