import { describe, expect, it } from "vitest";
import {
  CATALOGUE_RESOURCES,
  catalogueFieldLabel,
  catalogueFields,
  isCatalogueResource,
  toCatalogueFormValues,
} from "@/lib/admin/catalogue-config";
import { parseCatalogueForm } from "@/lib/admin/catalogue-form";
import { summariseCatalogueRecord } from "@/lib/admin/catalogue-summary";

function form(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) data.append(key, item);
    } else {
      data.append(key, value);
    }
  }

  return data;
}

const validHotel = {
  id: "HTL Goa Beach House!",
  name: "Beach House",
  city_code: "GOI",
  area: "Candolim",
  property_type: "Resort",
  star_rating: "5",
  guest_rating: "9.2",
  review_count: "120",
  price_per_night: "12000",
  tax_percent: "18",
  image: "https://res.cloudinary.com/demo/image/upload/v1/tripnest/hotels/beach.jpg",
  amenities: ["wifi", "pool"],
  room_type: "Suite",
  breakfast: "on",
  check_in: "14:00",
  check_out: "11:00",
  distance_km: "1.5",
  tagline: "A quiet beach house.",
  description: "A long description for the hotel.",
  featured: "on",
};

const validHoliday = {
  id: "holi-goa-susegad",
  slug: "Susegad By The Sea",
  title: "Susegad by the Sea",
  city_code: "GOI",
  country: "India",
  days: "4",
  nights: "3",
  price_per_person: "24500",
  rating: "4.7",
  review_count: "214",
  image: "/images/holidays/coast.svg",
  gallery:
    "/images/holidays/coast.svg\nhttps://res.cloudinary.com/demo/image/upload/v1/tripnest/holidays/gal.jpg",
  themes: ["beach", "food"],
  summary: "Three unhurried nights by the sea.",
  highlights: "Quiet beach\nSunset drive",
  inclusions: "Breakfast\nTransfers",
  exclusions: "Flights\nAlcohol",
  "itinerary.day": ["1", "2"],
  "itinerary.title": ["Arrive", "Explore"],
  "itinerary.detail": ["Check in and rest.", "A slow village walk."],
  departure_dates: "2027-01-10\n2027-02-14",
  featured: "on",
};

const validCar = {
  id: "car-maruti-alto",
  brand: "Maruti Suzuki",
  model: "Alto K10",
  variant: "VXI",
  year: "2024",
  city_code: "BLR",
  car_type: "Hatchback",
  transmission: "Manual",
  fuel: "Petrol",
  seats: "5",
  price_per_day: "3576",
  price_per_week: "25032",
  km_limit_per_day: "300",
  rating: "4.3",
  review_count: "24",
  distance_km: "1.2",
  host_name: "Rohan Mehta",
  host_type: "Professional",
  fastag: "on",
  delivery_fee: "299",
  deposit: "3000",
  image: "/images/cars/car-hatchback.svg",
  tagline: "Small footprint.",
  description: "A reliable hatchback.",
  featured: "on",
};

const validOffer = {
  id: "off-013",
  category: "hotels",
  eyebrow: "Stays",
  title: "A longer weekend",
  description: "A demo offer for longer stays.",
  code: "stay20",
  discount_label: "20% off",
  icon: "bed",
  tone: "teal",
  cta_label: "Browse stays",
  cta_href: "/hotels",
  valid_until: "2027-03-31",
  terms: "Demo offer only.",
  featured: "on",
};

describe("catalogue resources", () => {
  it.each([
    ["hotels", validHotel],
    ["holidays", validHoliday],
    ["cars", validCar],
    ["offers", { ...validOffer, image: validHotel.image }],
  ] as const)("limits %s to five photos on the server", (resource, values) => {
    const photos = Array.from({ length: 5 }, (_, index) => `/photo-${index}.jpg`);
    expect(
      parseCatalogueForm(resource, form({ ...values, gallery: photos.slice(0, 4) })).success,
    ).toBe(true);
    const result = parseCatalogueForm(resource, form({ ...values, gallery: photos }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.gallery).toBeDefined();
  });
  it("only accepts known resources", () => {
    for (const resource of CATALOGUE_RESOURCES) {
      expect(isCatalogueResource(resource)).toBe(true);
    }

    expect(isCatalogueResource("flights")).toBe(false);
    expect(isCatalogueResource("../hotels")).toBe(false);
    expect(isCatalogueResource(null)).toBe(false);
  });

  it("exposes a label for every configured field", () => {
    for (const resource of CATALOGUE_RESOURCES) {
      for (const field of catalogueFields(resource)) {
        expect(catalogueFieldLabel(resource, field.name)).toBe(field.label);
      }
    }
  });
});

describe("parseCatalogueForm hotels", () => {
  it("normalises identifiers, booleans, and multi-select values", () => {
    const result = parseCatalogueForm("hotels", form(validHotel));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      id: "htl-goa-beach-house",
      name: "Beach House",
      star_rating: 5,
      guest_rating: 9.2,
      amenities: ["wifi", "pool"],
      breakfast: true,
      free_cancellation: false,
      featured: true,
    });
    expect(result.data.sort_order).toBeUndefined();
  });

  it("reports the first problem per field", () => {
    const result = parseCatalogueForm(
      "hotels",
      form({ ...validHotel, name: "", property_type: "Castle", star_rating: "" }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.name).toBe("This field is required.");
    expect(result.fieldErrors.property_type).toBe("Choose a valid option.");
    expect(result.fieldErrors.star_rating).toBe("This field is required.");
    expect(result.message).toContain("Hotel name:");
  });

  it("requires the main image", () => {
    const result = parseCatalogueForm("hotels", form({ ...validHotel, image: "" }));

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.image).toBe("This field is required.");
  });

  it("uses the existing id on edit", () => {
    const withoutId = Object.fromEntries(
      Object.entries(validHotel).filter(([key]) => key !== "id"),
    );
    const result = parseCatalogueForm("hotels", form(withoutId), {
      fixedId: "htl-existing",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.id).toBe("htl-existing");
  });
});

describe("parseCatalogueForm holidays", () => {
  it("builds list, theme, itinerary, and date arrays", () => {
    const result = parseCatalogueForm("holidays", form(validHoliday));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.slug).toBe("susegad-by-the-sea");
    expect(result.data.gallery).toEqual([
      "/images/holidays/coast.svg",
      "https://res.cloudinary.com/demo/image/upload/v1/tripnest/holidays/gal.jpg",
    ]);
    expect(result.data.themes).toEqual(["beach", "food"]);
    expect(result.data.highlights).toEqual(["Quiet beach", "Sunset drive"]);
    expect(result.data.departure_dates).toEqual(["2027-01-10", "2027-02-14"]);
    expect(result.data.itinerary).toEqual([
      { day: 1, title: "Arrive", detail: "Check in and rest." },
      { day: 2, title: "Explore", detail: "A slow village walk." },
    ]);
    expect(result.data.nights).toBe(3);
  });

  it("rejects an incomplete itinerary row", () => {
    const result = parseCatalogueForm(
      "holidays",
      form({
        ...validHoliday,
        "itinerary.day": ["1"],
        "itinerary.title": [""],
        "itinerary.detail": ["Only a detail"],
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.itinerary).toBeDefined();
  });
});

describe("parseCatalogueForm cars", () => {
  it("accepts valid fleet data", () => {
    const result = parseCatalogueForm("cars", form(validCar));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      id: "car-maruti-alto",
      seats: 5,
      fastag: true,
      home_delivery: false,
      guest_favorite: false,
      host_type: "Professional",
    });
  });
});

describe("parseCatalogueForm offers", () => {
  it("uppercases promo codes and keeps artwork optional", () => {
    const result = parseCatalogueForm("offers", form(validOffer));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.code).toBe("STAY20");
    expect(result.data.image).toBeUndefined();
  });

  it("keeps an uploaded artwork URL", () => {
    const result = parseCatalogueForm(
      "offers",
      form({ ...validOffer, image: "https://res.cloudinary.com/demo/offers/card.jpg" }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.image).toBe("https://res.cloudinary.com/demo/offers/card.jpg");
  });
});

describe("catalogue form values", () => {
  it("only returns configured fields with safe defaults", () => {
    const values = toCatalogueFormValues("offers", {
      id: "off-013",
      title: "A demo offer",
      featured: true,
      sort_order: 9,
      _id: "mongo-only",
    });

    expect(values.id).toBe("off-013");
    expect(values.title).toBe("A demo offer");
    expect(values.featured).toBe(true);
    expect(values.image).toBe("");
    expect(values.sort_order).toBeUndefined();
    expect(values._id).toBeUndefined();
  });

  it("gives list fields an empty array and checkboxes false", () => {
    const values = toCatalogueFormValues("holidays", {});

    expect(values.gallery).toEqual([]);
    expect(values.itinerary).toEqual([]);
    expect(values.featured).toBe(false);
    expect(values.days).toBe("");
  });
});

describe("catalogue summaries", () => {
  it("summarises hotels and links to the public detail page", () => {
    const summary = summariseCatalogueRecord("hotels", {
      id: "htl-bom-harbour",
      name: "Harbour & Hush",
      area: "Colaba",
      city_code: "BOM",
      star_rating: 5,
      price_per_night: 18500,
      image: "/images/stays/stay-1.svg",
      featured: true,
    });

    expect(summary).toEqual({
      id: "htl-bom-harbour",
      title: "Harbour & Hush",
      subtitle: "Colaba · BOM",
      meta: "5★ · ₹18,500 / night",
      editHref: "/admin/hotels/htl-bom-harbour",
      publicHref: "/hotels/htl-bom-harbour",
      image: "/images/stays/stay-1.svg",
      featured: true,
    });
  });

  it("uses the holiday slug for the public link", () => {
    const summary = summariseCatalogueRecord("holidays", {
      id: "holi-goa",
      slug: "susegad-by-the-sea",
      title: "Susegad by the Sea",
      country: "India",
      days: 4,
      nights: 3,
      rating: 4.7,
      price_per_person: 24500,
      featured: false,
    });

    expect(summary?.publicHref).toBe("/holidays/susegad-by-the-sea");
    expect(summary?.subtitle).toBe("India · 4D/3N");
    expect(summary?.meta).toBe("4.7★ · ₹24,500 pp");
  });

  it("combines car brand and model", () => {
    const summary = summariseCatalogueRecord("cars", {
      id: "car-alto",
      brand: "Maruti Suzuki",
      model: "Alto K10",
      variant: "VXI",
      city_code: "BLR",
      price_per_day: 3576,
      price_per_week: 25032,
      seats: 5,
    });

    expect(summary?.title).toBe("Maruti Suzuki Alto K10");
    expect(summary?.meta).toBe("₹3,576 / day · ₹25,032 / week · 5 seats");
  });

  it("keeps offers icon-based when there is no artwork", () => {
    const summary = summariseCatalogueRecord("offers", {
      id: "off-001",
      eyebrow: "Flights",
      title: "First flight",
      code: "NESTFLY",
      discount_label: "Up to 12% off",
    });

    expect(summary).toMatchObject({
      title: "First flight",
      subtitle: "Flights · NESTFLY",
      meta: "Up to 12% off",
      publicHref: "/offers",
      image: undefined,
    });
  });

  it("returns null when a document has no id", () => {
    expect(summariseCatalogueRecord("hotels", { name: "No id" })).toBeNull();
  });
});
