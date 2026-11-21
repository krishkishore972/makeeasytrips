import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import type { GoaEvent } from "@/lib/data/schemas";
import { eventCategoryLabel, eventEnquiryTarget, eventSchedule } from "@/lib/event-presentation";

export function EventCard({ event }: { event: GoaEvent }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-shadow hover:shadow-md">
      <Link href={`/events/${event.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-950">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1 text-[10px] font-extrabold text-brand-800">
            {eventCategoryLabel(event.category)}
          </span>
          <span className="absolute right-3 bottom-3 rounded-full bg-brand-950/80 px-3 py-1 text-[10px] font-bold text-white">
            Goa
          </span>
        </div>
        <div className="p-5 pb-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {eventSchedule(event)}
          </p>
          <h3 className="mt-2 flex items-start justify-between gap-3 text-xl leading-tight">
            {event.title}
            <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted">
            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            {event.venue} · {event.area}, Goa
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{event.summary}</p>
        </div>
      </Link>
      <div className="mt-auto p-5">
        <p className="mb-3 text-xs font-extrabold text-ink">{event.price_label}</p>
        <EnquiryDialog
          target={eventEnquiryTarget(event)}
          label="Enquire about this event"
          size="sm"
          className="w-full"
        />
      </div>
    </article>
  );
}
