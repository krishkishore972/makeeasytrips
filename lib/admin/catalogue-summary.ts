import type { CatalogueResource } from "@/lib/admin/catalogue-config";

export type CatalogueSummary = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  editHref: string;
  publicHref?: string;
  image?: string;
  featured: boolean;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numeric(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function inr(value: unknown): string {
  const number = numeric(value);
  if (number === null) return "₹—";
  return `₹${Math.round(number).toLocaleString("en-IN")}`;
}

function rating(value: unknown): string {
  const number = numeric(value);
  return number === null ? "" : `${number.toLocaleString("en-IN")}`;
}

function editHref(resource: CatalogueResource, id: string): string {
  return `/admin/${resource}/${encodeURIComponent(id)}`;
}

/**
 * Turn a raw Mongo document into the few values the admin tables need. This is
 * deliberately tolerant: a malformed document should still be visible so the
 * operator can open it and fix it.
 */
export function summariseCatalogueRecord(
  resource: CatalogueResource,
  record: Record<string, unknown>,
): CatalogueSummary | null {
  const id = text(record.id);
  if (!id) return null;

  const featured = record.featured === true;

  if (resource === "events") {
    const slug = text(record.slug);
    return {
      id,
      title: text(record.title) || id,
      subtitle: [text(record.venue), text(record.area), "Goa"].filter(Boolean).join(" · "),
      meta: [text(record.event_date) || "Dates on request", text(record.price_label)]
        .filter(Boolean)
        .join(" · "),
      editHref: editHref(resource, id),
      publicHref: slug ? `/events/${encodeURIComponent(slug)}` : undefined,
      image: text(record.image) || undefined,
      featured,
    };
  }

  if (resource === "hotels") {
    const title = text(record.name) || id;
    const area = text(record.area);
    const city = text(record.city_code);
    const stars = numeric(record.star_rating);

    return {
      id,
      title,
      subtitle: [area, city].filter(Boolean).join(" · "),
      meta: [stars === null ? null : `${stars}★`, `${inr(record.price_per_night)} / night`]
        .filter(Boolean)
        .join(" · "),
      editHref: editHref(resource, id),
      publicHref: `/hotels/${encodeURIComponent(id)}`,
      image: text(record.image) || undefined,
      featured,
    };
  }

  if (resource === "holidays") {
    const title = text(record.title) || id;
    const slug = text(record.slug);
    const days = numeric(record.days);
    const nights = numeric(record.nights);
    const duration = days === null ? "" : `${days}D${nights === null ? "" : `/${nights}N`}`;

    return {
      id,
      title,
      subtitle: [text(record.country), duration].filter(Boolean).join(" · "),
      meta: [
        rating(record.rating) && `${rating(record.rating)}★`,
        `${inr(record.price_per_person)} pp`,
      ]
        .filter(Boolean)
        .join(" · "),
      editHref: editHref(resource, id),
      publicHref: slug ? `/holidays/${encodeURIComponent(slug)}` : undefined,
      image: text(record.image) || undefined,
      featured,
    };
  }

  if (resource === "cars") {
    const brand = text(record.brand);
    const model = text(record.model);
    const title = [brand, model].filter(Boolean).join(" ") || id;

    return {
      id,
      title,
      subtitle: [text(record.variant), text(record.city_code)].filter(Boolean).join(" · "),
      meta: [
        `${inr(record.price_per_day)} / day`,
        `${inr(record.price_per_week)} / week`,
        `${numeric(record.seats) ?? "—"} seats`,
      ].join(" · "),
      editHref: editHref(resource, id),
      publicHref: `/rent-a-car/${encodeURIComponent(id)}`,
      image: text(record.image) || undefined,
      featured,
    };
  }

  const title = text(record.title) || id;

  return {
    id,
    title,
    subtitle: [text(record.eyebrow), text(record.code)].filter(Boolean).join(" · "),
    meta: text(record.discount_label) || text(record.category),
    editHref: editHref(resource, id),
    publicHref: "/offers",
    image: text(record.image) || undefined,
    featured,
  };
}
