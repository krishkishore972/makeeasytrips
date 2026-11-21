import Link from "next/link";
import { ArrowUpRight, PartyPopper } from "lucide-react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import { EventCard } from "@/components/events/event-card";
import { getEvents } from "@/lib/data/events";
import { goaEventPlanningTarget } from "@/lib/event-presentation";

export async function HomeEvents() {
  const events = await getEvents();
  const spotlight = [...events].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3);
  return (
    <section className="section-padding border-y border-line bg-brand-50/60">
      <div className="page-container">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">More reasons to come together</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Your occasion. Our Goa.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              We organise events in Goa—from celebrations to team gatherings. Explore the
              possibilities and plan it with us on WhatsApp.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-brand-700"
          >
            Explore events in Goa <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {spotlight.length ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spotlight.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <PartyPopper aria-hidden="true" className="size-8 shrink-0 text-brand-600" />
              <div>
                <h3 className="text-xl">Something special on your calendar?</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Tell us your dates, guest count, and ideas for an event in Goa.
                </p>
              </div>
            </div>
            <EnquiryDialog target={goaEventPlanningTarget} label="Plan an event in Goa" />
          </div>
        )}
      </div>
    </section>
  );
}
