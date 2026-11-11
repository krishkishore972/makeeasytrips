import { describe, expect, it } from "vitest";
import {
  contactSubmissionSchema,
  enquirySubmissionSchema,
  newsletterSubmissionSchema,
} from "@/lib/validation/forms";

describe("enquirySubmissionSchema", () => {
  const base = {
    name: "Ananya Rao",
    phone: "9876543210",
    service: "hotel",
    title: "Harbour & Hush, Mumbai",
    context: ["13 Nov → 17 Nov", "2 guests"],
  };

  it("accepts a complete enquiry and keeps the service context", () => {
    const parsed = enquirySubmissionSchema.parse(base);

    expect(parsed).toMatchObject(base);
  });

  it("normalises an Indian prefix before storing the phone number", () => {
    expect(enquirySubmissionSchema.parse({ ...base, phone: "+91 98765 43210" }).phone).toBe(
      "9876543210",
    );
    expect(enquirySubmissionSchema.parse({ ...base, phone: "09876543210" }).phone).toBe(
      "9876543210",
    );
  });

  it("defaults the context to an empty list", () => {
    expect(enquirySubmissionSchema.parse({ ...base, context: undefined }).context).toEqual([]);
  });

  it("rejects an unknown service", () => {
    const result = enquirySubmissionSchema.safeParse({ ...base, service: "train" });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number and a blank title", () => {
    expect(enquirySubmissionSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(enquirySubmissionSchema.safeParse({ ...base, title: "   " }).success).toBe(false);
  });

  it("caps the amount of context attached to an enquiry", () => {
    const result = enquirySubmissionSchema.safeParse({
      ...base,
      context: Array.from({ length: 9 }, (_, index) => `Line ${index}`),
    });

    expect(result.success).toBe(false);
  });
});

describe("newsletterSubmissionSchema", () => {
  it("trims and lowercases the email address", () => {
    expect(newsletterSubmissionSchema.parse({ email: "  Reader@Example.COM " }).email).toBe(
      "reader@example.com",
    );
  });

  it("rejects addresses that are not email shaped", () => {
    expect(newsletterSubmissionSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(newsletterSubmissionSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("contactSubmissionSchema", () => {
  const base = {
    name: "Ananya Rao",
    email: "ananya@example.com",
    phone: "",
    message: "We are planning a week in Goa and would like two stay options.",
  };

  it("accepts a message without a phone number", () => {
    const parsed = contactSubmissionSchema.parse(base);

    expect(parsed.phone).toBeUndefined();
    expect(parsed.message).toContain("Goa");
  });

  it("normalises a supplied phone number", () => {
    expect(contactSubmissionSchema.parse({ ...base, phone: "+91 98765 43210" }).phone).toBe(
      "9876543210",
    );
  });

  it("rejects a bad phone number, a short message, and a bad email", () => {
    expect(contactSubmissionSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(contactSubmissionSchema.safeParse({ ...base, message: "Too short" }).success).toBe(
      false,
    );
    expect(contactSubmissionSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });

  it("caps the message length", () => {
    expect(contactSubmissionSchema.safeParse({ ...base, message: "a".repeat(2001) }).success).toBe(
      false,
    );
  });
});
