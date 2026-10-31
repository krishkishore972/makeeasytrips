import { z } from "zod";

/**
 * Business WhatsApp number used for every service enquiry. The value is read at
 * build time because Next.js inlines `NEXT_PUBLIC_*` variables in the client
 * bundle. Keep the fallback in sync with the number published in the README.
 */
export const DEFAULT_WHATSAPP_NUMBER = "917013114599";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export const whatsappNumber =
  digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "") || DEFAULT_WHATSAPP_NUMBER;

export const enquiryServiceValues = ["flight", "hotel", "holiday", "car"] as const;
export type EnquiryService = (typeof enquiryServiceValues)[number];

export const ENQUIRY_SERVICE_LABELS: Record<EnquiryService, string> = {
  flight: "Flight",
  hotel: "Stay",
  holiday: "Holiday",
  car: "Car rental",
};

/** Strip common Indian dialling prefixes so 10-digit validation is predictable. */
export function normaliseIndianMobile(value: string) {
  const digits = digitsOnly(value);

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

export const enquiryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Please keep your name under 80 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .superRefine((value, ctx) => {
      if (!/^[6-9]\d{9}$/.test(normaliseIndianMobile(value))) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid 10-digit Indian mobile number.",
        });
      }
    }),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export type EnquiryTarget = {
  service: EnquiryService;
  title: string;
  context?: readonly string[];
};

export type EnquiryMessageInput = EnquiryFormValues & {
  target: EnquiryTarget;
};

/**
 * Build the pre-filled WhatsApp message. WhatsApp renders `*text*` as bold, so
 * the trip name stays easy to spot in the chat.
 */
export function buildWhatsAppEnquiryMessage({ target, name, phone }: EnquiryMessageInput) {
  const serviceLabel = ENQUIRY_SERVICE_LABELS[target.service];
  const context = (target.context ?? []).map((line) => line.trim()).filter(Boolean);

  const lines = [
    `Hi TripNest, I would like to enquire about this ${serviceLabel.toLowerCase()}.`,
    "",
    `Interested item: *${target.title.trim()}*`,
    ...context.map((line) => `• ${line}`),
    "",
    `Name: ${name.trim()}`,
    `Phone: +91 ${normaliseIndianMobile(phone)}`,
    "",
    "Sent from the TripNest website.",
  ];

  return lines.join("\n");
}

export function whatsappEnquiryUrl(message: string, number = whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
