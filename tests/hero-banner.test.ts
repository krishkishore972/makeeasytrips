import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroBanner, type HeroSlide } from "@/components/home/hero-banner";

describe("landing banner", () => {
  it("renders listing links and accessible carousel controls", () => {
    const slides: HeroSlide[] = [
      {
        href: "/hotels/example",
        image: "/one.svg",
        category: "Popular hotel",
        title: "Hotel",
        detail: "Stay",
      },
      {
        href: "/holidays/example",
        image: "/two.svg",
        category: "Popular holiday",
        title: "Holiday",
        detail: "Trip",
      },
      {
        href: "/rent-a-car/example",
        image: "/three.svg",
        category: "Popular car",
        title: "Car",
        detail: "Drive",
      },
    ];
    const html = renderToStaticMarkup(createElement(HeroBanner, { slides }));
    expect(html).toContain('href="/hotels/example"');
    expect(html).toContain('href="/holidays/example"');
    expect(html).toContain('href="/rent-a-car/example"');
    expect(html).toContain("Next featured listing");
    expect(html).toContain("Previous featured listing");
  });
  it("renders a useful empty state", () => {
    expect(renderToStaticMarkup(createElement(HeroBanner, { slides: [] }))).toContain(
      "Discover stays, holidays and self-drive cars.",
    );
  });
});
