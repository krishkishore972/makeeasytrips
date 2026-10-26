import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Compass, Luggage, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "My trips",
  description:
    "A demo trip hub. TripNest does not create accounts, store personal details, or make real bookings.",
  alternates: {
    canonical: "/my-trips",
  },
};

const promises = [
  {
    icon: CalendarCheck2,
    title: "Everything in one place",
    detail: "Itineraries, stays, and transfer notes will sit together here.",
  },
  {
    icon: Compass,
    title: "Easy to pick back up",
    detail: "Return to a search or a saved idea without starting over.",
  },
  {
    icon: ShieldCheck,
    title: "No account required",
    detail: "This demo never creates a session or stores personal details.",
  },
] as const;

export default function MyTripsPage() {
  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-xs sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Luggage aria-hidden="true" className="size-8" />
          </span>
          <p className="eyebrow mt-6">Your journeys</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)]">No trips yet.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
            When the booking flow arrives, completed demo trips will appear here. TripNest does not
            create accounts or keep personal details, so there is nothing to sign in to.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/holidays"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              Explore holidays
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/flights"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              Search flights
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {promises.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-xl border border-line bg-surface p-5">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
