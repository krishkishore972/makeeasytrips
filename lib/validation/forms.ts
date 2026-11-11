import { z } from "zod";
import { enquiryFormSchema, enquiryServiceValues, normaliseIndianMobile } from "@/lib/enquiry";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

/**
 * The dialog collects the person details; the service and item come from the
 * page the dialog was opened on. They are validated together so the API cannot
 * store an enquiry without a known service and title.
 */
export const enquirySubmissionSchema = enquiryFormSchema
  .extend({
    service: z.enum(enquiryServiceValues),
    title: z
      .string()
      .trim()
      .min(1, "The selected item is missing.")
      .max(200, "The selected item name is too long."),
    context: z.array(z.string().trim().min(1).max(300)).max(8).default([]),
    // Older clients and existing rows may omit these, so they stay optional.
    itemId: z.string().trim().min(1).max(120).optional(),
    itemHref: z
      .string()
      .trim()
      .max(300)
      .regex(/^\/(?:hotels|holidays|rent-a-car|flights)\/[a-z0-9][a-z0-9-]*$/i, {
        error: "Expected an internal catalogue path.",
      })
      .optional(),
  })
  .transform((value) => ({
    ...value,
    phone: normaliseIndianMobile(value.phone),
  }));

export type EnquirySubmission = z.infer<typeof enquirySubmissionSchema>;

export const newsletterSubmissionSchema = z.object({
  email: emailField,
});

export type NewsletterSubmission = z.infer<typeof newsletterSubmissionSchema>;

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Please keep your name under 80 characters."),
  email: emailField,
  phone: z
    .string()
    .trim()
    .max(20, "Please keep your phone number under 20 characters.")
    .optional()
    .transform((value) => (value ? normaliseIndianMobile(value) : undefined))
    .refine(
      (value) => !value || /^[6-9]\d{9}$/.test(value),
      "Enter a valid 10-digit Indian mobile number.",
    ),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(2000, "Please keep your message under 2,000 characters."),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
