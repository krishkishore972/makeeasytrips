import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventCard } from "@/components/events/event-card";
import { EventGallery } from "@/components/events/event-gallery";
import { LiveEventsTicker } from "@/components/events/live-events-banner";
import { eventSchema } from "@/lib/data/schemas";
import { buildWhatsAppEnquiryMessage, whatsappEnquiryUrl } from "@/lib/enquiry";
import {
  eventEnquiryTarget,
  eventSchedule,
  eventTickerDate,
  goaEventPlanningTarget,
  upcomingGoaEvents,
} from "@/lib/event-presentation";
import { enquirySubmissionSchema } from "@/lib/validation/forms";
import { siteConfig } from "@/lib/site";

const event = () =>
  eventSchema.parse({
    id: "evt-goa-gathering",
    slug: "goa-gathering",
    title: "A gathering in Goa",
    category: "celebrations",
    summary: "An occasion planned around your guests.",
    description: "Celebrate together in Goa with a plan shaped around you.",
    venue: "Venue on enquiry",
    area: "Panaji",
    event_date: "2027-01-15",
    start_time: "18:30",
    image: "/images/holidays/coast.svg",
    gallery: ["/images/holidays/backwaters.svg"],
    highlights: ["Personal planning"],
    featured: true,
  });

describe("Goa events public experience", () => {
  it("links event cards to details and WhatsApp enquiries, not checkout", () => {
    const html = renderToStaticMarkup(createElement(EventCard, { event: event() }));
    expect(html).toContain('href="/events/goa-gathering"');
    expect(html).toContain("Enquire about this event");
    expect(html).toContain("Goa");
    expect(html).not.toContain("/booking");
    expect(html).not.toContain("Book tickets");
  });

  it("shows every unique event photo", () => {
    const images = ["/one.png", "/two.png", "/three.png", "/four.png", "/five.png"];
    const html = renderToStaticMarkup(
      createElement(EventGallery, {
        title: "Goa event",
        images: [...images, images[0]],
      }),
    );
    for (const image of images) expect(html).toContain(encodeURIComponent(image));
    expect(html.match(/<img /g)).toHaveLength(5);
  });

  it("formats the event date and time consistently in Goa's timezone", () => {
    expect(eventSchedule(event())).toContain("15 Jan 2027");
    expect(eventSchedule(event())).toContain("6:30");
    expect(eventSchedule(event())).toContain("IST");
    expect(eventSchedule({ event_date: "", start_time: "" })).toBe("Dates on enquiry");
  });

  it("passes event identity, venue, and customer plans through the existing enquiry flow", () => {
    const target = eventEnquiryTarget(event());
    const customer = {
      name: "Test Customer",
      phone: "+91 98765 43210",
      details: "A celebration for 40 guests.",
    };
    const submission = enquirySubmissionSchema.parse({ ...customer, ...target });
    expect(submission.itemHref).toBe("/events/goa-gathering");
    expect(submission.service).toBe("event");
    expect(submission.details).toBe(customer.details);
    const message = buildWhatsAppEnquiryMessage({ ...customer, target });
    expect(message).toContain("this event");
    expect(message).toContain("*A gathering in Goa*");
    expect(message).toContain("Panaji, Goa");
    expect(message).toContain(customer.details);
    expect(message).toContain("Phone: +91 9876543210");
    expect(new URL(whatsappEnquiryUrl(message)).searchParams.get("text")).toBe(message);
  });

  it("supports a general Goa event enquiry before any listings are added", () => {
    expect(
      enquirySubmissionSchema.safeParse({
        name: "Test Customer",
        phone: "9876543210",
        ...goaEventPlanningTarget,
      }).success,
    ).toBe(true);
  });

  it("includes events in public and footer navigation", () => {
    expect(siteConfig.navigation.some((link) => link.href === "/events")).toBe(true);
    expect(siteConfig.footer.explore.some((link) => link.href === "/events")).toBe(true);
  });

  it("rejects oversized enquiry details", () => {
    expect(
      enquirySubmissionSchema.safeParse({
        name: "Test Customer",
        phone: "9876543210",
        ...eventEnquiryTarget(event()),
        details: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("keeps only scheduled events that are still ahead, soonest first", () => {
    const now = new Date("2026-11-21T10:00:00+05:30");
    const base = event();
    const past = { ...base, id: "evt-past", slug: "past", event_date: "2026-11-20" };
    const today = { ...base, id: "evt-today", slug: "today", event_date: "2026-11-21" };
    const later = { ...base, id: "evt-later", slug: "later", event_date: "2026-12-05" };
    const undated = { ...base, id: "evt-undated", slug: "undated", event_date: "" };

    expect(upcomingGoaEvents([later, undated, past, today], now).map((item) => item.id)).toEqual([
      "evt-today",
      "evt-later",
    ]);
    expect(upcomingGoaEvents([past, undated], now)).toEqual([]);
  });

  it("lets admin switch a scheduled event out of the banner", () => {
    const now = new Date("2026-11-21T10:00:00+05:30");
    const visible = { ...event(), id: "evt-visible", slug: "visible" };
    const hidden = {
      ...event(),
      id: "evt-hidden",
      slug: "hidden",
      show_in_banner: false,
    };

    expect(upcomingGoaEvents([hidden, visible], now).map((item) => item.id)).toEqual([
      "evt-visible",
    ]);
    expect(
      renderToStaticMarkup(
        createElement(LiveEventsTicker, { events: upcomingGoaEvents([hidden], now) }),
      ),
    ).toBe("");
  });

  it("labels ticker dates relative to today in Goa's timezone", () => {
    const now = new Date("2026-11-21T10:00:00+05:30");

    expect(eventTickerDate({ event_date: "2026-11-21", start_time: "18:30" }, now)).toBe(
      "Today, 6:30 pm",
    );
    expect(eventTickerDate({ event_date: "2026-11-22", start_time: "" }, now)).toBe("Tomorrow");
    expect(eventTickerDate({ event_date: "2026-12-05", start_time: "" }, now)).toBe("5 Dec");
    expect(eventTickerDate({ event_date: "", start_time: "" }, now)).toBe("Dates on enquiry");
  });

  it("renders a looping live ticker that links to each upcoming event", () => {
    const html = renderToStaticMarkup(
      createElement(LiveEventsTicker, {
        events: [event(), { ...event(), id: "evt-second", slug: "second", title: "Second event" }],
      }),
    );

    expect(html).toContain("Live in Goa");
    expect(html).toContain("Upcoming live events in Goa");
    expect(html).toContain("animate-marquee-right");
    expect(html).toContain('href="/events/second"');
    expect(html).toContain('href="/events"');

    // The schedule repeats to fill wide screens, then the whole loop is copied
    // once for the seamless wrap. Only the first copy is keyboard reachable.
    const totalEventLinks = (html.match(/href="\/events\/(?:goa-gathering|second)"/g) ?? []).length;
    expect(totalEventLinks).toBeGreaterThanOrEqual(8);
    expect(totalEventLinks % 2).toBe(0);
    expect(html.match(/tabindex="-1"/g)).toHaveLength(totalEventLinks / 2);
  });

  it("renders no ticker when nothing is scheduled", () => {
    expect(renderToStaticMarkup(createElement(LiveEventsTicker, { events: [] }))).toBe("");
  });
});
