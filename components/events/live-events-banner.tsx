import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import type { GoaEvent } from "@/lib/data/schemas";
import { getEvents } from "@/lib/data/events";
import { eventTickerDate, upcomingGoaEvents } from "@/lib/event-presentation";

const MAX_BANNER_EVENTS = 8;

/** Roughly one ticker entry at the 12px type size used in the bar. */
const ESTIMATED_ITEM_WIDTH = 420;

/** One copy of the loop must cover the widest desktop viewport we support. */
const MIN_LOOP_WIDTH = 2560;

/** Repeat the schedule until one copy fills a wide screen, so the loop has no blank gap. */
function tickerLoop(events: GoaEvent[]) {
  const repeats = Math.min(
    8,
    Math.max(1, Math.ceil(MIN_LOOP_WIDTH / (events.length * ESTIMATED_ITEM_WIDTH))),
  );

  return Array.from({ length: repeats }, () => events).flat();
}

/**
 * Site-wide ticker for scheduled events. Reads the database per request so a
 * new or edited event appears without waiting for a cache window to expire.
 */
export async function LiveEventsBanner() {
  await connection();

  const upcoming = upcomingGoaEvents(await getEvents()).slice(0, MAX_BANNER_EVENTS);

  if (!upcoming.length) return null;

  return <LiveEventsTicker events={upcoming} />;
}

/**
 * The ticker repeats the list once so the strip can loop without a seam. The
 * second copy is decorative: hidden from assistive tech and skipped by Tab.
 */
export function LiveEventsTicker({ events }: { events: GoaEvent[] }) {
  const items = events.slice(0, MAX_BANNER_EVENTS);

  if (!items.length) return null;

  const loop = tickerLoop(items);
  // Ten seconds per entry keeps the ticker readable; faster reads as a blur.
  const duration = `${Math.max(30, loop.length * 10)}s`;

  return (
    <aside
      aria-label="Upcoming live events in Goa"
      className="border-b border-white/10 bg-brand-950 text-white"
    >
      <div className="mx-auto flex h-12 w-full max-w-[90rem] items-center gap-3 px-4 sm:h-14 sm:px-6">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] whitespace-nowrap text-white uppercase">
          <span aria-hidden="true" className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />
            <span className="relative inline-flex size-1.5 rounded-full bg-white" />
          </span>
          Live in Goa
        </span>

        <div className="marquee-viewport relative min-w-0 flex-1 overflow-hidden">
          <div
            className="marquee-track flex w-max animate-marquee-right items-center"
            style={{ animationDuration: duration }}
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex shrink-0 items-center"
              >
                {loop.map((event, index) => (
                  <li key={`${copy}-${index}-${event.id}`} className="shrink-0">
                    <Link
                      href={`/events/${event.slug}`}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold whitespace-nowrap text-white/90 transition-colors hover:text-white"
                    >
                      <span className="font-extrabold text-gold-500">{eventTickerDate(event)}</span>
                      <span aria-hidden="true" className="size-1 rounded-full bg-white/35" />
                      <span className="font-bold">{event.title}</span>
                      <span className="text-white/60">· {event.area}, Goa</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <Link
          href="/events"
          className="hidden shrink-0 items-center gap-1 text-[11px] font-bold text-gold-500 transition-colors hover:text-gold-100 sm:flex"
        >
          All events
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
