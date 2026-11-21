import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, Check, MapPin, MessageCircle, PartyPopper } from "lucide-react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import { EventGallery } from "@/components/events/event-gallery";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { getEventBySlug } from "@/lib/data/events";
import { eventCategoryLabel, eventEnquiryTarget, eventSchedule } from "@/lib/event-presentation";
import EventsLoading from "../loading";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const event = await getEventBySlug((await params).slug);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} · Events in Goa`,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
  };
}

export default function EventDetailPage(props: Props) {
  return (
    <Suspense fallback={<EventsLoading />}>
      <EventDetailContent {...props} />
    </Suspense>
  );
}

async function EventDetailContent({ params }: Props) {
  await connection();
  const event = await getEventBySlug((await params).slug);
  if (!event) notFound();
  return (
    <div className="page-container py-7 sm:py-10">
      <Breadcrumbs items={[{ label: "Events in Goa", href: "/events" }, { label: event.title }]} />
      <div className="mt-6">
        <p className="eyebrow">{eventCategoryLabel(event.category)} · Goa</p>
        <h1 className="mt-3 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-tight">
          {event.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{event.summary}</p>
      </div>
      <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <EventGallery title={event.title} images={[event.image, ...(event.gallery ?? [])]} />
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-2xl">About this event</h2>
            <p className="mt-4 text-sm leading-8 whitespace-pre-line text-muted">
              {event.description}
            </p>
            {event.highlights.length ? (
              <>
                <h3 className="mt-6 text-lg">What to look forward to</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {event.highlights.map((highlight, index) => (
                    <li
                      key={`${highlight}-${index}`}
                      className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm leading-6 text-ink-soft"
                    >
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-700"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> All events in Goa
          </Link>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-36">
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <p className="eyebrow">Let’s make it happen</p>
            <h2 className="mt-3 text-2xl">Enquire about this event</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="flex items-center gap-2 text-xs font-bold text-muted">
                  <CalendarDays aria-hidden="true" className="size-4 text-brand-600" /> When
                </dt>
                <dd className="mt-1 pl-6 text-sm font-semibold">{eventSchedule(event)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-bold text-muted">
                  <MapPin aria-hidden="true" className="size-4 text-brand-600" /> Where
                </dt>
                <dd className="mt-1 pl-6 text-sm font-semibold">
                  {event.venue}
                  <br />
                  {event.area}, Goa
                </dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-line pt-5 text-base font-extrabold text-brand-800">
              {event.price_label}
            </p>
            <EnquiryDialog
              target={eventEnquiryTarget(event)}
              label="Enquire on WhatsApp"
              className="mt-4 w-full"
            />
            <p className="mt-3 text-xs leading-6 text-muted">
              Fill in your name, phone number, and plans. Your enquiry is saved and WhatsApp opens
              with the event details. Press send there to reach our team.
            </p>
          </section>
          <section className="rounded-2xl bg-brand-50 p-5">
            <PartyPopper aria-hidden="true" className="size-6 text-brand-700" />
            <h3 className="mt-3 text-lg">Organised in Goa. Planned with you.</h3>
            <p className="mt-2 text-xs leading-6 text-muted">
              We organise events in Goa only. Dates, venue arrangements, and pricing are confirmed
              personally by our team—there’s no online ticket or payment step.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs font-bold text-brand-700">
              <MessageCircle aria-hidden="true" className="size-4" /> Direct WhatsApp enquiries
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
