import {
  catalogueFieldLabel,
  catalogueFields,
  type CatalogueField,
  type CatalogueResource,
} from "@/lib/admin/catalogue-config";
import { carSchema, holidaySchema, hotelSchema, offerSchema } from "@/lib/data/schemas";

const schemas = {
  hotels: hotelSchema,
  holidays: holidaySchema,
  cars: carSchema,
  offers: offerSchema,
} as const;

export type CatalogueParseResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; message: string; fieldErrors: Record<string, string> };

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function normaliseIdentifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fieldValue(field: CatalogueField, formData: FormData): unknown {
  switch (field.kind) {
    case "checkbox": {
      const value = formData.get(field.name);
      return value === "on" || value === "true" || value === "1";
    }
    case "multiselect":
      return formData
        .getAll(field.name)
        .filter((value): value is string => typeof value === "string" && value.length > 0);
    case "gallery":
      return formData.getAll(field.name).flatMap((value) =>
        typeof value === "string"
          ? value
              .split(/\r?\n/)
              .map((url) => url.trim())
              .filter(Boolean)
          : [],
      );
    case "list":
    case "date-list":
      return readString(formData, field.name)
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean);
    case "itinerary": {
      const days = formData.getAll(`${field.name}.day`);
      const titles = formData.getAll(`${field.name}.title`);
      const details = formData.getAll(`${field.name}.detail`);
      const length = Math.max(days.length, titles.length, details.length);
      const rows: { day: unknown; title: string; detail: string }[] = [];

      for (let index = 0; index < length; index += 1) {
        const day = String(days[index] ?? "").trim();
        const title = String(titles[index] ?? "").trim();
        const detail = String(details[index] ?? "").trim();

        if (!day && !title && !detail) continue;

        rows.push({
          day: day === "" ? undefined : day,
          title,
          detail,
        });
      }

      return rows;
    }
    case "number": {
      const value = readString(formData, field.name);
      return value === "" ? undefined : value;
    }
    case "image": {
      const value = readString(formData, field.name);
      return value === "" && field.optional ? undefined : value;
    }
    case "text": {
      const value = readString(formData, field.name);

      switch (field.format) {
        case "identifier":
        case "slug":
          return normaliseIdentifier(value);
        case "uppercase":
          return value.toUpperCase();
        default:
          return value;
      }
    }
    default:
      return readString(formData, field.name);
  }
}

function describeIssue(issue: {
  code?: string;
  message?: string;
  minimum?: number | bigint;
  maximum?: number | bigint;
  origin?: string;
}): string {
  switch (issue.code) {
    case "invalid_type":
    case "too_small":
      return typeof issue.minimum === "number" && issue.origin !== "string"
        ? `Must be at least ${issue.minimum}.`
        : "This field is required.";
    case "too_big":
      return typeof issue.maximum === "number"
        ? `Must be at most ${issue.maximum}.`
        : "This value is too large.";
    case "invalid_value":
    case "invalid_enum_value":
      return "Choose a valid option.";
    case "invalid_format":
    case "invalid_string":
      return "Use the expected format.";
    default:
      return issue.message || "Enter a valid value.";
  }
}

export type ParseCatalogueOptions = {
  /**
   * On edit the identity field is not rendered. The server supplies the
   * existing id so the parser still produces a complete schema-shaped record.
   */
  fixedId?: string;
};

export function parseCatalogueForm(
  resource: CatalogueResource,
  formData: FormData,
  options: ParseCatalogueOptions = {},
): CatalogueParseResult {
  const fields = catalogueFields(resource);
  const raw: Record<string, unknown> = {};

  for (const field of fields) {
    raw[field.name] = fieldValue(field, formData);
  }

  if (options.fixedId) {
    raw.id = options.fixedId;
  }

  const gallery = raw.gallery as string[];
  const photoCount = (raw.image ? 1 : 0) + gallery.filter((url) => url !== raw.image).length;
  if (photoCount > 5) {
    return {
      success: false,
      message: "Use at most five photos in total.",
      fieldErrors: { gallery: "Use at most five photos in total." },
    };
  }

  const result = schemas[resource].safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  const fieldErrors: Record<string, string> = {};
  let firstMessage = "";

  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    const label = key === "_form" ? "This record" : catalogueFieldLabel(resource, key);
    const detail = describeIssue(issue);
    const message = `${label}: ${detail}`;

    if (!firstMessage) firstMessage = message;
    if (!fieldErrors[key]) fieldErrors[key] = detail;
  }

  return {
    success: false,
    message: firstMessage || "Check the highlighted fields and save again.",
    fieldErrors,
  };
}
