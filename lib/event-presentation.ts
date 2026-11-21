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

/** Calendar day in Goa's timezone, as `YYYY-MM-DD`. */
function goaDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).format(date);
}

/**
 * Events still ahead of us, soonest first. Undated listings stay out of the
 * live banner because they are not scheduled yet; they remain on /events.
 * Admin can also switch an event out of the banner.
 */
export function upcomingGoaEvents(events: GoaEvent[], now = new Date()): GoaEvent[] {
  const today = goaDateKey(now);

  return events
    .filter((event) => event.show_in_banner !== false && event.event_date >= today)
    .sort(
      (a, b) =>
        a.event_date.localeCompare(b.event_date) ||
        a.start_time.localeCompare(b.start_time) ||
        a.title.localeCompare(b.title),
    );
}

/** Compact date for the ticker: "Today, 6:30 pm", "Tomorrow" or "15 Jan". */
export function eventTickerDate(
  event: Pick<GoaEvent, "event_date" | "start_time">,
  now = new Date(),
) {
  if (!event.event_date) return "Dates on enquiry";

  const today = goaDateKey(now);
  const tomorrow = goaDateKey(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const day =
    event.event_date === today
      ? "Today"
      : event.event_date === tomorrow
        ? "Tomorrow"
        : new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          }).format(new Date(`${event.event_date}T00:00:00+05:30`));

  if (!event.start_time) return day;

  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${event.event_date}T${event.start_time}:00+05:30`));

  return `${day}, ${time}`;
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
