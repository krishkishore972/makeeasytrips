import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, MapPin, PartyPopper, Search, Sparkles } from "lucide-react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import { EventCard } from "@/components/events/event-card";
import { getEvents } from "@/lib/data/events";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-options";
import { eventSchedule, goaEventPlanningTarget } from "@/lib/event-presentation";
import { firstParam } from "@/lib/utils";
import EventsLoading from "./loading";

export const metadata: Metadata = {
  title: "Events in Goa",
  description:
    "We organise events in Goa. Explore music, celebrations, weddings, and corporate gatherings, and enquire directly with Makeasytrips on WhatsApp.",
  alternates: { canonical: "/events" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function EventsPage(props: Props) {
  return (
    <Suspense fallback={<EventsLoading />}>
      <EventsContent {...props} />
    </Suspense>
  );
}

async function EventsContent({ searchParams }: Props) {
  await connection();
  const [events, params] = await Promise.all([getEvents(), searchParams]);
  const category = firstParam(params.category) ?? "";
  const query = (firstParam(params.q) ?? "").trim().slice(0, 100);
  const filtered = events.filter(
    (event) =>
      (!category || event.category === category) &&
      (!query ||
        `${event.title} ${event.summary} ${event.venue} ${event.area}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const featured = events.find((event) => event.featured) ?? events[0];
  const categoryHref = (value: string) => {
    const search = new URLSearchParams();
    if (value) search.set("category", value);
    if (query) search.set("q", query);
    return `/events${search.size ? `?${search}` : ""}#all-events`;
  };

  return (
    <>
      <section className="hero-mesh overflow-hidden text-white">
        <div className="page-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-brand-100">
              <MapPin aria-hidden="true" className="size-3.5" /> Only in Goa
            </p>
            <h1 className="mt-5 max-w-2xl text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.03] text-white">
              Good company.
              <br />
              Great occasions.
              <br />
              <span className="text-gradient-sun italic">Goa, always.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/75">
              We organise events in Goa. From music-filled evenings to personal celebrations and
              team gatherings, tell us the occasion and we’ll help bring it together.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <EnquiryDialog target={goaEventPlanningTarget} label="Plan an event in Goa" />
              <Link
                href="#all-events"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-bold text-white hover:bg-white/10"
              >
                Explore events <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/60">
              Personal planning · WhatsApp enquiries · No online ticket checkout
            </p>
          </div>
          {featured ? (
            <Link
              href={`/events/${featured.slug}`}
              className="group relative block overflow-hidden rounded-3xl border border-white/20 bg-brand-950 shadow-lg"
            >
              <div className="relative aspect-[5/4]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  preload
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-gold-300 flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  {featured.featured ? "In the spotlight" : "Explore in Goa"}
                </p>
                <h2 className="mt-2 text-3xl text-white">{featured.title}</h2>
                <p className="mt-2 text-xs text-white/80">
                  {eventSchedule(featured)} · {featured.area}, Goa
                </p>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                  View event <ArrowRight aria-hidden="true" className="size-4" />
                </p>
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 sm:p-10">
              <PartyPopper aria-hidden="true" className="text-gold-300 size-14" />
              <p className="mt-7 text-xs font-bold tracking-widest text-brand-100 uppercase">
                Your occasion. Our home ground.
              </p>
              <h2 className="mt-3 text-3xl text-white">A little Goa makes it memorable.</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Planning something special? Share your dates, guest count, and ideas. We’ll talk
                through the possibilities with you on WhatsApp.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="all-events" className="page-container scroll-mt-32 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Find your occasion</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Events, with a Goa state of mind.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Browse what we organise, then enquire for availability and a plan shaped around you.
            </p>
          </div>
          <form action="/events" role="search" className="flex w-full gap-2 sm:w-auto">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <label className="sr-only" htmlFor="event-search">
              Search events
            </label>
            <input
              id="event-search"
              type="search"
              name="q"
              defaultValue={query}
              maxLength={100}
              placeholder="Search events or venues"
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              aria-label="Search events"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-700 text-white hover:bg-brand-800"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
          </form>
        </div>
        <nav aria-label="Event categories" className="mt-7 flex flex-wrap gap-2">
          {[{ value: "", label: "All events" }, ...EVENT_CATEGORY_OPTIONS].map((option) => (
            <Link
              key={option.value}
              href={categoryHref(option.value)}
              aria-current={category === option.value ? "page" : undefined}
              className={`rounded-full border px-4 py-2.5 text-xs font-bold transition-colors ${
                category === option.value
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line bg-surface text-ink-soft hover:border-brand-300"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs font-semibold text-muted" role="status">
          {filtered.length} {filtered.length === 1 ? "event" : "events"} in Goa
          {query ? ` matching “${query}”` : ""}
        </p>
        {filtered.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
            <CalendarDays aria-hidden="true" className="mx-auto size-9 text-brand-600" />
            <h3 className="mt-4 text-2xl">
              {events.length ? "No events match just yet." : "Your next occasion starts here."}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
              {events.length
                ? "Try another category or search, or tell us what you have in mind."
                : "Our event listings are being prepared. You can still talk to us about organising your event in Goa."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {category || query ? (
                <Link
                  href="/events"
                  className="inline-flex items-center rounded-xl border border-line px-5 py-3 text-sm font-bold"
                >
                  Clear filters
                </Link>
              ) : null}
              <EnquiryDialog target={goaEventPlanningTarget} label="Plan an event in Goa" />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
