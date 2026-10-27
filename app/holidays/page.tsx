import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  MapPin,
  Palmtree,
  RotateCcw,
  Sparkles,
  Tag,
} from "lucide-react";
import { HolidayCard } from "@/components/holidays/holiday-card";
import { HolidayFilters } from "@/components/holidays/holiday-filters";
import { HolidaySearchForm } from "@/components/holidays/holiday-search-form";
import { HolidaysPageSkeleton } from "@/components/holidays/holiday-skeletons";
import { ActiveFilters, type ActiveFilterChip } from "@/components/search/active-filters";
import { MobileFilterDrawer } from "@/components/search/mobile-filter-drawer";
import { SortSelect } from "@/components/search/sort-select";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  buildHolidayFacets,
  getFeaturedHolidays,
  getHolidayCityStats,
  getHolidayDestinations,
  getHolidays,
  searchHolidays,
} from "@/lib/data/holidays";
import {
  HOLIDAY_DURATION_OPTIONS,
  HOLIDAY_PRICE_BAND_OPTIONS,
  HOLIDAY_SORT_OPTIONS,
  HOLIDAY_THEME_OPTIONS,
} from "@/lib/search-options";
import { parseHolidaySearchParams } from "@/lib/validation/search";
import { formatCurrency, toQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Holiday packages",
  description:
    "Browse original demo holiday packages with thoughtful pacing, clear inclusions, and room to make them yours.",
  alternates: {
    canonical: "/holidays",
  },
};

type HolidaysPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function HolidaysPage({ searchParams }: HolidaysPageProps) {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Holidays" }]} />

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Holiday packages</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
                A holiday with room to breathe.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Short escapes and longer loops, built around a place rather than a checklist. Every
                package, date, and price below is fictional demo inventory.
              </p>
            </div>
            <Link
              href="/offers?category=holidays"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              <Tag aria-hidden="true" className="size-4 text-brand-600" />
              Holiday offers
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <Suspense fallback={<HolidaysPageSkeleton />}>
          <HolidaysExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function HolidaysExperience({ searchParams }: HolidaysPageProps) {
  await connection();
  const params = await searchParams;
  const parsed = parseHolidaySearchParams(params);

  const [destinations, allHolidays, cityStats] = await Promise.all([
    getHolidayDestinations(),
    getHolidays(),
    getHolidayCityStats(),
  ]);

  const cityByCode = new Map(destinations.map((city) => [city.code, city]));
  const destinationNames = Object.fromEntries(destinations.map((city) => [city.code, city.name]));

  const scopeHolidays = parsed.query.destination
    ? allHolidays.filter((holiday) => holiday.city_code === parsed.query.destination)
    : allHolidays;
  const facets = buildHolidayFacets(scopeHolidays);
  const results = parsed.error ? [] : await searchHolidays(parsed.query);
  const featured = !parsed.hasFilters && !parsed.error ? await getFeaturedHolidays(4) : [];

  const themeLabels = new Map(HOLIDAY_THEME_OPTIONS.map((option) => [option.value, option.label]));
  const durationLabels = new Map(
    HOLIDAY_DURATION_OPTIONS.map((option) => [option.value, option.label]),
  );
  const priceLabels = new Map(
    HOLIDAY_PRICE_BAND_OPTIONS.map((option) => [option.value, option.label]),
  );

  const filterChips: ActiveFilterChip[] = [
    ...(parsed.query.destination
      ? [
          {
            key: "destination",
            value: parsed.query.destination,
            label: cityByCode.get(parsed.query.destination)?.name ?? parsed.query.destination,
            mode: "value" as const,
          },
        ]
      : []),
    ...parsed.query.themes.map((theme) => ({
      key: "theme",
      value: theme,
      label: themeLabels.get(theme) ?? theme,
      mode: "list" as const,
    })),
    ...parsed.query.durations.map((duration) => ({
      key: "duration",
      value: duration,
      label: durationLabels.get(duration) ?? duration,
      mode: "list" as const,
    })),
    ...parsed.query.priceBands.map((band) => ({
      key: "price",
      value: band,
      label: priceLabels.get(band) ?? band,
      mode: "list" as const,
    })),
  ];

  const resetHref = `/holidays${toQueryString({
    travellers: parsed.query.travellers !== 2 ? parsed.query.travellers : null,
    sort: parsed.query.sort !== "recommended" ? parsed.query.sort : null,
  })}`;

  const initial = {
    destination: parsed.query.destination ?? "",
    duration: parsed.query.durations[0] ?? "",
    travellers: parsed.query.travellers,
  };

  return (
    <>
      <HolidaySearchForm destinations={destinations} initial={initial} />

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
            href="/holidays"
            className="inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-4"
          >
            Start over
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {parsed.hasFilters && !parsed.error ? (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-brand-900">
                <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                {parsed.query.destination
                  ? (cityByCode.get(parsed.query.destination)?.name ?? parsed.query.destination)
                  : "All destinations"}
                {parsed.query.destination ? (
                  <span className="font-mono text-[11px] text-brand-600">
                    {parsed.query.destination}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {parsed.query.themes.length > 0
                  ? parsed.query.themes.map((theme) => themeLabels.get(theme) ?? theme).join(" · ")
                  : "Every theme"}{" "}
                · {parsed.query.travellers}{" "}
                {parsed.query.travellers === 1 ? "traveller" : "travellers"}
              </p>
            </div>
            <Link
              href={resetHref}
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset filters
            </Link>
          </div>
          <p className="mt-2 border-t border-brand-100 pt-2 text-[11px] leading-5 text-muted">
            Prices are per person on twin sharing. The 5% demo taxes and fees are added to the
            package total, never to a real payment.
          </p>
        </div>
      ) : null}

      {!parsed.hasFilters && !parsed.error ? (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="featured-holidays-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Featured this season</p>
                <h2
                  id="featured-holidays-heading"
                  className="mt-2 text-2xl leading-tight sm:text-3xl"
                >
                  Four trips we would take ourselves.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  Fictional packages with the strongest traveller notes. Use the filters below to
                  narrow the full catalogue by mood, length, or budget.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">
                <Sparkles aria-hidden="true" className="size-3.5 text-gold-600" />
                {featured.length} featured
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((holiday) => (
                <HolidayCard
                  key={holiday.id}
                  holiday={holiday}
                  travellers={parsed.query.travellers}
                  cityName={cityByCode.get(holiday.city_code)?.name}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="holiday-destinations-heading">
            <div>
              <p className="eyebrow">Where to go</p>
              <h2
                id="holiday-destinations-heading"
                className="mt-2 text-2xl leading-tight sm:text-3xl"
              >
                Ten places, ten different paces.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                The catalogue covers a small, deliberate set of destinations. Each one has at least
                one package chosen for a different kind of trip.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {destinations.map((city) => {
                const stats = cityStats.get(city.code);
                return (
                  <Link
                    key={city.code}
                    href={`/holidays${toQueryString({
                      destination: city.code,
                      travellers: parsed.query.travellers !== 2 ? parsed.query.travellers : null,
                    })}`}
                    className="group card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <Compass aria-hidden="true" className="size-4 text-brand-600" />
                        {city.name}
                      </p>
                      <span className="font-mono text-[10px] font-bold text-muted-soft">
                        {city.code}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
                      {city.tagline}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-soft">
                          {stats?.count ?? 0} {stats?.count === 1 ? "package" : "packages"} · from
                        </p>
                        <p className="text-sm font-extrabold text-ink">
                          {formatCurrency(stats?.minPrice ?? 0)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700">
                        Explore
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      <section aria-labelledby="holiday-results-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{parsed.hasFilters ? "Your matches" : "The full catalogue"}</p>
            <h2 id="holiday-results-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
              {parsed.hasFilters ? "Trips that fit the brief." : "Every package, side by side."}
            </h2>
            <p className="mt-2 text-sm font-bold text-ink">
              <span className="text-lg font-extrabold">{results.length}</span>{" "}
              {results.length === 1 ? "package" : "packages"}
              <span className="font-normal text-muted">
                {parsed.query.destination
                  ? ` in ${cityByCode.get(parsed.query.destination)?.name ?? parsed.query.destination}`
                  : " across India"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MobileFilterDrawer
              title="Filter holidays"
              activeCount={filterChips.length}
              className="lg:hidden"
            >
              <HolidayFilters
                facets={facets}
                query={parsed.query}
                destinationNames={destinationNames}
              />
            </MobileFilterDrawer>
            <SortSelect
              value={parsed.query.sort}
              options={HOLIDAY_SORT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </div>
        </div>

        <div className="mt-3">
          <ActiveFilters
            filters={filterChips}
            clearKeys={["destination", "theme", "duration", "price"]}
          />
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block" aria-label="Holiday filters">
            <div className="sticky top-28 rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <HolidayFilters
                facets={facets}
                query={parsed.query}
                destinationNames={destinationNames}
              />
            </div>
          </aside>

          <div>
            {results.length > 0 ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((holiday, index) => (
                    <HolidayCard
                      key={holiday.id}
                      holiday={holiday}
                      travellers={parsed.query.travellers}
                      cityName={cityByCode.get(holiday.city_code)?.name}
                      priority={index === 0}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-muted-soft">
                  Itineraries, dates, ratings, and availability are part of the mock catalogue. No
                  trip is booked and no payment is taken.
                </p>
              </>
            ) : scopeHolidays.length === 0 ? (
              <EmptyState
                title="No demo packages in that destination yet."
                description="The holiday catalogue currently covers ten destinations. Try one of the places above, or clear the destination and browse everything."
                actions={
                  <Link
                    href="/holidays"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    <Palmtree aria-hidden="true" className="size-3.5" />
                    See all packages
                  </Link>
                }
              />
            ) : (
              <EmptyState
                title="No packages match those filters."
                description="Loosen a theme, length, or budget filter to see more of the catalogue. Your destination and traveller count will stay as they are."
                actions={
                  <Link
                    href={resetHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Clear filters
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
