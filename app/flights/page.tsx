import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, BedDouble, RotateCcw } from "lucide-react";
import { FlightCard } from "@/components/flights/flight-card";
import { FlightFilters } from "@/components/flights/flight-filters";
import { FlightSearchForm } from "@/components/flights/flight-search-form";
import { FlightsPageSkeleton } from "@/components/flights/flight-skeletons";
import { PopularRoutes } from "@/components/flights/popular-routes";
import { ActiveFilters, type ActiveFilterChip } from "@/components/search/active-filters";
import { MobileFilterDrawer } from "@/components/search/mobile-filter-drawer";
import { SortSelect } from "@/components/search/sort-select";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/lib/dates";
import {
  buildFlightFacets,
  getFlightCities,
  getFlights,
  getPopularRoutes,
  searchFlights,
} from "@/lib/data/flights";
import {
  CABIN_OPTIONS,
  DEPARTURE_WINDOW_OPTIONS,
  DURATION_BAND_OPTIONS,
  FLIGHT_SORT_OPTIONS,
} from "@/lib/search-options";
import { parseFlightSearchParams } from "@/lib/validation/search";
import { toQueryString } from "@/lib/utils";

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
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Flights" }]} />

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Flights</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
                Clear skies, clearer fares.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Compare total journey time, stops, baggage, and the rules behind the price. Every
                fare below is fictional demo inventory.
              </p>
            </div>
            <Link
              href="/hotels"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              <BedDouble aria-hidden="true" className="size-4 text-brand-600" />
              Prefer a stay? Browse hotels
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <Suspense fallback={<FlightsPageSkeleton />}>
          <FlightsExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function FlightsExperience({ searchParams }: FlightsPageProps) {
  await connection();
  const params = await searchParams;
  const parsed = parseFlightSearchParams(params);

  const [cities, allFlights] = await Promise.all([getFlightCities(), getFlights()]);
  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const fromCity = parsed.query.from ? cityByCode.get(parsed.query.from) : undefined;
  const toCity = parsed.query.to ? cityByCode.get(parsed.query.to) : undefined;

  const routeFlights =
    parsed.query.from && parsed.query.to
      ? allFlights.filter(
          (flight) => flight.from_code === parsed.query.from && flight.to_code === parsed.query.to,
        )
      : [];

  const facets = buildFlightFacets(routeFlights, parsed.query.cabin);
  const results = parsed.hasRoute && !parsed.error ? await searchFlights(parsed.query) : [];
  const popularRoutes = !parsed.hasRoute && !parsed.error ? await getPopularRoutes(6) : [];

  const cabinLabel =
    CABIN_OPTIONS.find((option) => option.value === parsed.query.cabin)?.label ?? "Economy";
  const depart = parsed.query.depart ?? "";
  const baseHref = `/flights${toQueryString({
    from: parsed.query.from,
    to: parsed.query.to,
    depart,
    return: parsed.query.returnDate,
    pax: parsed.query.pax,
    cabin: parsed.query.cabin,
  })}`;

  const filterChips: ActiveFilterChip[] = [
    ...parsed.query.stops.map((stop) => ({
      key: "stops",
      value: stop,
      label: stop === "0" ? "Nonstop" : "1 stop",
      mode: "list" as const,
    })),
    ...parsed.query.airlines.map((code) => ({
      key: "airlines",
      value: code,
      label: facets.airlines.find((facet) => facet.value === code)?.label ?? code,
      mode: "list" as const,
    })),
    ...parsed.query.windows.map((window) => ({
      key: "window",
      value: window,
      label: DEPARTURE_WINDOW_OPTIONS.find((option) => option.value === window)?.label ?? window,
      mode: "list" as const,
    })),
    ...parsed.query.durations.map((duration) => ({
      key: "duration",
      value: duration,
      label: DURATION_BAND_OPTIONS.find((option) => option.value === duration)?.label ?? duration,
      mode: "list" as const,
    })),
    ...(parsed.query.refundableOnly
      ? [
          {
            key: "refundable",
            label: "Refundable only",
            mode: "value" as const,
          },
        ]
      : []),
  ];

  const initial = {
    from: parsed.query.from ?? cities[0]?.code ?? "BOM",
    to: parsed.query.to ?? cities[1]?.code ?? "GOI",
    depart,
    returnDate: parsed.query.returnDate ?? "",
    pax: parsed.query.pax,
    cabin: parsed.query.cabin,
  };

  return (
    <>
      <FlightSearchForm cities={cities} initial={initial} />

      {parsed.error ? (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">That search needs a small fix.</p>
            <p className="mt-1 text-xs leading-5">{parsed.error}</p>
          </div>
          <Link
            href="/flights"
            className="inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-4"
          >
            Start over
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {parsed.hasRoute && !parsed.error ? (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-brand-900">
                {fromCity?.name ?? parsed.query.from}
                <span className="font-mono text-[11px] text-brand-600">{parsed.query.from}</span>
                <ArrowRight aria-hidden="true" className="size-3.5 text-brand-500" />
                {toCity?.name ?? parsed.query.to}
                <span className="font-mono text-[11px] text-brand-600">{parsed.query.to}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {formatDateShort(depart)} · {parsed.query.pax}{" "}
                {parsed.query.pax === 1 ? "traveller" : "travellers"} · {cabinLabel}
                {parsed.query.returnDate
                  ? ` · returning ${formatDateShort(parsed.query.returnDate)}`
                  : " · one way"}
              </p>
            </div>
            <Link
              href={baseHref}
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset filters
            </Link>
          </div>
          {parsed.query.returnDate ? (
            <p className="mt-2 border-t border-brand-100 pt-2 text-[11px] leading-5 text-muted">
              Showing outbound options. Return-leg selection and combined fares are not modelled in
              this demo.
            </p>
          ) : null}
        </div>
      ) : null}

      {!parsed.hasRoute && !parsed.error ? (
        <PopularRoutes routes={popularRoutes} depart={depart} />
      ) : null}

      {parsed.hasRoute && !parsed.error ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block" aria-label="Flight filters">
            <div className="sticky top-28 rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <FlightFilters facets={facets} query={parsed.query} />
            </div>
          </aside>

          <section aria-labelledby="flight-results-heading">
            <h2 id="flight-results-heading" className="sr-only">
              Flight results
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">
                <span className="text-lg font-extrabold">{results.length}</span>{" "}
                {results.length === 1 ? "flight" : "flights"}
                <span className="font-normal text-muted"> on this route</span>
              </p>
              <div className="flex items-center gap-2">
                <MobileFilterDrawer
                  title="Filter flights"
                  activeCount={filterChips.length}
                  className="lg:hidden"
                >
                  <FlightFilters facets={facets} query={parsed.query} />
                </MobileFilterDrawer>
                <SortSelect
                  value={parsed.query.sort}
                  options={FLIGHT_SORT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <div className="mt-3">
              <ActiveFilters
                filters={filterChips}
                clearKeys={["stops", "airlines", "window", "duration", "refundable"]}
              />
            </div>

            {results.length > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {results.map((result) => (
                    <FlightCard
                      key={result.flight.id}
                      result={result}
                      query={parsed.query}
                      fromCity={fromCity?.name}
                      toCity={toCity?.name}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-muted-soft">
                  Fares are per traveller and include demo taxes. Baggage, seats, and on-time
                  figures are part of the mock catalogue.
                </p>
              </>
            ) : routeFlights.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="No demo flights on this route yet."
                description="The catalogue currently covers ten Indian cities. Try a popular pairing, or start a different search."
                actions={
                  <>
                    <Link
                      href={`/flights${toQueryString({
                        from: "BOM",
                        to: "GOI",
                        depart,
                        pax: parsed.query.pax,
                        cabin: parsed.query.cabin,
                      })}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                    >
                      Try Mumbai → Goa
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                    <Link
                      href="/flights"
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft"
                    >
                      Start a new search
                    </Link>
                  </>
                }
              />
            ) : (
              <EmptyState
                className="mt-4"
                title="No flights match those filters."
                description="Loosen a filter or reset them to see the full route again. Your dates and traveller count will stay as they are."
                actions={
                  <Link
                    href={baseHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Clear filters
                  </Link>
                }
              />
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
