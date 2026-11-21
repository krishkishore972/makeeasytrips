import type { GoaEvent } from "@/lib/data/schemas";
import type { EnquiryTarget } from "@/lib/enquiry";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-options";

export function eventCategoryLabel(category: string) {
  return EVENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

export function eventSchedule(event: Pick<GoaEvent, "event_date" | "start_time">) {
  if (!event.event_date) return "Dates on enquiry";
  const date = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${event.event_date}T00:00:00+05:30`));
  if (!event.start_time) return date;
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${event.event_date}T${event.start_time}:00+05:30`));
  return `${date} · ${time} IST`;
}

export function eventEnquiryTarget(event: GoaEvent): EnquiryTarget {
  return {
    service: "event",
    title: event.title,
    itemId: event.id,
    itemHref: `/events/${event.slug}`,
    context: [
      `Location: ${event.venue}, ${event.area}, Goa`,
      eventSchedule(event),
      `Category: ${eventCategoryLabel(event.category)}`,
      event.price_label,
    ],
  };
}

export const goaEventPlanningTarget: EnquiryTarget = {
  service: "event",
  title: "Organise an event in Goa",
  context: [
    "We organise events in Goa only.",
    "Share your preferred date, guest count, and plans.",
  ],
};
