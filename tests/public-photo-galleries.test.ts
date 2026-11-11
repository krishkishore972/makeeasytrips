import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { HolidayGallery } from "@/components/holidays/holiday-gallery";
import { CarGallery } from "@/components/cars/car-gallery";
import { OfferCard } from "@/components/offers/offer-card";
import type { Offer } from "@/lib/data/schemas";

const images = ["/one.png", "/two.png", "/three.png", "/four.png", "/five.png"];

describe("public photo galleries", () => {
  it("renders all holiday photos", () => {
    const html = renderToStaticMarkup(createElement(HolidayGallery, { title: "Trip", images }));
    for (const url of images) expect(html).toContain(encodeURIComponent(url));
  });
  it("renders all car photos", () => {
    const html = renderToStaticMarkup(
      createElement(CarGallery, { name: "Car", city: "Goa", images }),
    );
    for (const url of images) expect(html).toContain(encodeURIComponent(url));
  });
  it("renders all offer artwork", () => {
    const offer: Offer = {
      id: "offer",
      category: "hotels",
      eyebrow: "Stay",
      title: "Offer",
      description: "Details",
      image: images[0],
      gallery: images.slice(1),
      code: "OFFER",
      discount_label: "Save",
      icon: "bed",
      tone: "teal",
      cta_label: "Go",
      cta_href: "/hotels",
      valid_until: "2027-12-31",
      terms: "Terms",
      featured: false,
    };
    const html = renderToStaticMarkup(createElement(OfferCard, { offer }));
    expect(html).toContain(images[0]);
    for (const url of images.slice(1)) expect(html).toContain(encodeURIComponent(url));
  });
});
