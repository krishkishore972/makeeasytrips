import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Plane, Search } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Flights",
  description:
    "Compare demo flights across Indian cities with clear fares, flexible filters, and no hidden extras.",
  alternates: {
    canonical: "/flights",
  },
};

type FlightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function FlightsPage({ searchParams }: FlightsPageProps) {
  return (
    <FeaturePreview
      eyebrow="Flights"
      title="Clear skies, clearer fares."
      description="A flight search built for comparing what matters: total time, stops, baggage, and the rules behind the price. Results and filters arrive in Phase 2."
      icon={Plane}
      phase="Phase 2 · flight search and results"
      highlights={[
        "Route, date, and traveller search with URL-backed state",
        "Sort by cheapest, quickest, or best overall",
        "Filter by stops, airline, time, duration, and fare type",
        "A details drawer with baggage, cancellation, and fare rules",
      ]}
      primaryAction={{ label: "Browse holiday ideas", href: "/holidays" }}
      secondaryAction={{ label: "See current offers", href: "/offers" }}
    >
      <Suspense fallback={<SearchSummaryFallback />}>
        <SearchSummary searchParams={searchParams} />
      </Suspense>
    </FeaturePreview>
  );
}

async function SearchSummary({ searchParams }: FlightsPageProps) {
  const params = await searchParams;
  const from = firstParam(params.from);
  const to = firstParam(params.to);
  const depart = firstParam(params.depart);
  const returnDate = firstParam(params.return);
  const pax = firstParam(params.pax);
  const cabin = firstParam(params.cabin);

  const hasSearch = Boolean(from || to || depart);

  if (!hasSearch) return null;

  return (
    <div className="mt-7 rounded-xl border border-brand-100 bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-brand-700 uppercase">
        <Search aria-hidden="true" className="size-3.5" />
        Search received
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        <span className="font-extrabold">{from ?? "Anywhere"}</span>
        <span aria-hidden="true" className="mx-2 text-muted-soft">
          →
        </span>
        <span className="font-extrabold">{to ?? "Anywhere"}</span>
        {depart ? <span className="text-muted"> · {depart}</span> : null}
        {returnDate ? <span className="text-muted"> → {returnDate}</span> : null}
        {pax ? <span className="text-muted"> · {pax} travellers</span> : null}
        {cabin ? <span className="text-muted"> · {cabin}</span> : null}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        The URL state works. Phase 2 will turn this query into a real result list with filters,
        sorting, and a booking summary.
      </p>
      <Link
        href="/#plan"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
      >
        Refine this search
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>
  );
}

function SearchSummaryFallback() {
  return (
    <div aria-hidden="true" className="shimmer-surface mt-7 h-28 rounded-xl border border-line" />
  );
}
