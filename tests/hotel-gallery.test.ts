import { describe, expect, it } from "vitest";
import { hotelGalleryImages } from "@/lib/data/hotel-gallery";

describe("hotelGalleryImages", () => {
  it("uses the main photo followed by additional photos, without duplicates", () => {
    expect(
      hotelGalleryImages("https://example.com/main.jpg", [
        "https://example.com/main.jpg",
        "https://example.com/room.jpg",
      ]),
    ).toEqual(["https://example.com/main.jpg", "https://example.com/room.jpg"]);
  });

  it("does not replace a single uploaded photo with demo SVGs", () => {
    expect(hotelGalleryImages("https://example.com/main.jpg")).toEqual([
      "https://example.com/main.jpg",
    ]);
  });

  it("keeps the legacy illustrated gallery for seeded hotels", () => {
    expect(hotelGalleryImages("/images/stays/stay-6.svg")).toEqual([
      "/images/stays/stay-6.svg",
      "/images/stays/stay-1.svg",
      "/images/stays/stay-2.svg",
    ]);
  });

  it("uses a placeholder when no image is supplied", () => {
    expect(hotelGalleryImages("")).toEqual(["/images/stays/stay-1.svg"]);
  });
});
