import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CarFront,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { CarFilters } from "@/components/cars/car-filters";
import { CarSearchForm } from "@/components/cars/car-search-form";
import { CarResultsSkeleton } from "@/components/cars/car-skeletons";
import { ActiveFilters, type ActiveFilterChip } from "@/components/search/active-filters";
import { MobileFilterDrawer } from "@/components/search/mobile-filter-drawer";
import { SortSelect } from "@/components/search/sort-select";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  addDaysISO,
  addHoursToISODateTime,
  formatDateTimeShort,
  formatRentalDuration,
  isMonday,
} from "@/lib/dates";
import {
  buildCarFacets,
  getCarCities,
  getCars,
  getFeaturedCars,
  searchCars,
} from "@/lib/data/cars";
import {
  CAR_BUDGET_OPTIONS,
  CAR_MODE_OPTIONS,
  CAR_RATING_OPTIONS,
  CAR_SEAT_BAND_OPTIONS,
  CAR_SORT_OPTIONS,
  CAR_TYPE_OPTIONS,
  type CarMode,
} from "@/lib/search-options";
import { parseCarSearchParams } from "@/lib/validation/search";
import { formatCurrency, toQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search self-drive cars",
  description:
    "Compare fictional self-drive cars by city, pick-up time, body style, transmission, fuel, seats, and kilometre plan.",
  robots: {
    index: false,
    follow: true,
  },
};

type CarSearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function modeWindow(mode: CarMode, start: string) {
  if (mode === "subscription") {
    return { start, end: addHoursToISODateTime(start, 24 * 8) };
  }

  if (mode === "weekday") {
    let weekdayStart = start;
    for (let index = 0; index < 7; index += 1) {
      const candidate = `${addDaysISO(start.slice(0, 10), index)}T10:00`;
      if (isMonday(candidate.slice(0, 10))) {
        weekdayStart = candidate;
        break;
      }
    }
    return { start: weekdayStart, end: addHoursToISODateTime(weekdayStart, 24 * 5) };
  }

  return { start, end: addHoursToISODateTime(start, 48) };
}

export default function CarSearchPage({ searchParams }: CarSearchPageProps) {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="page-container py-3">
          <Breadcrumbs
            items={[{ label: "Rent a car", href: "/rent-a-car" }, { label: "Search" }]}
          />
        </div>
      </div>

      <div className="page-container py-6 sm:py-8">
        <Suspense fallback={<CarResultsSkeleton />}>
          <CarSearchExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function CarSearchExperience({ searchParams }: CarSearchPageProps) {
  await connection();
  const params = await searchParams;
  const parsed = parseCarSearchParams(params);

  const [cities, allCars, featured] = await Promise.all([
    getCarCities(),
    getCars(),
    getFeaturedCars(4),
  ]);

  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const city = parsed.query.city ? cityByCode.get(parsed.query.city) : undefined;

  const cityCars = parsed.query.city
    ? allCars.filter((car) => car.city_code === parsed.query.city)
    : [];
  const facets = buildCarFacets(cityCars);
  const results = parsed.hasCity && !parsed.error ? await searchCars(parsed.query) : [];

  const baseHref = `/rent-a-car/search${toQueryString({
    city: parsed.query.city,
    start: parsed.query.start,
    end: parsed.query.end,
    mode: parsed.query.mode,
  })}`;

  const typeLabels = new Map(CAR_TYPE_OPTIONS.map((option) => [option.value, option.label]));
  const budgetLabels = new Map(CAR_BUDGET_OPTIONS.map((option) => [option.value, option.label]));
  const seatLabels = new Map(CAR_SEAT_BAND_OPTIONS.map((option) => [option.value, option.label]));

  const filterChips: ActiveFilterChip[] = [
    ...parsed.query.budgets.map((band) => ({
      key: "budget",
      value: band,
      label: budgetLabels.get(band) ?? band,
      mode: "list" as const,
    })),
    ...parsed.query.types.map((type) => ({
      key: "type",
      value: type,
      label: typeLabels.get(type) ?? type,
      mode: "list" as const,
    })),
    ...parsed.query.transmissions.map((value) => ({
      key: "transmission",
      value,
      label: value,
      mode: "list" as const,
    })),
    ...parsed.query.fuels.map((value) => ({
      key: "fuel",
      value,
      label: value,
      mode: "list" as const,
    })),
    ...parsed.query.seatBands.map((band) => ({
      key: "seats",
      value: band,
      label: seatLabels.get(band) ?? band,
      mode: "list" as const,
    })),
    ...(parsed.query.minRating !== null
      ? [
          {
            key: "rating",
            value: String(parsed.query.minRating),
            label:
              CAR_RATING_OPTIONS.find((option) => option.value === String(parsed.query.minRating))
                ?.label ?? `${parsed.query.minRating}+ rated`,
            mode: "value" as const,
          },
        ]
      : []),
    ...(parsed.query.minYear !== null
      ? [
          {
            key: "year",
            value: String(parsed.query.minYear),
            label: `${parsed.query.minYear} or newer`,
            mode: "value" as const,
          },
        ]
      : []),
    ...(parsed.query.maxDistance !== null
      ? [
          {
            key: "distance",
            value: String(parsed.query.maxDistance),
            label: `Within ${parsed.query.maxDistance} km`,
            mode: "value" as const,
          },
        ]
      : []),
    ...(parsed.query.fastagOnly
      ? [{ key: "fastag", label: "Active FASTag", mode: "value" as const }]
      : []),
    ...(parsed.query.deliveryOnly
      ? [{ key: "delivery", label: "Home delivery", mode: "value" as const }]
      : []),
  ];

  const initial = {
    city: parsed.query.city ?? "",
    start: parsed.query.start,
    end: parsed.query.end,
    mode: parsed.query.mode,
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Rent a car</p>
          <h1 className="mt-2 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.05]">
            Find the car for the road you have in mind.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every result is a specific demo model with its own host, kilometre plan, and distance
            from the city centre.
          </p>
        </div>
        <Link
          href="/rent-a-car"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
        >
          <CarFront aria-hidden="true" className="size-4 text-brand-600" />
          Rent a car home
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="mt-5">
        <CarSearchForm
          cities={cities.map((option) => ({ code: option.code, name: option.name }))}
          initial={initial}
        />
      </div>

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
            href="/rent-a-car/search"
            className="inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-4"
          >
            Start over
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {parsed.hasCity && !parsed.error ? (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-brand-900">
                <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                {city?.name ?? parsed.query.city}
                <span className="font-mono text-[11px] text-brand-600">{parsed.query.city}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock aria-hidden="true" className="size-3.5" />
                  {formatDateTimeShort(parsed.query.start)}
                </span>
                <span aria-hidden="true">→</span>
                <span>{formatDateTimeShort(parsed.query.end)}</span>
                <span aria-hidden="true">·</span>
                <span>{formatRentalDuration(parsed.query.hours)}</span>
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

          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-100 pt-3">
            {CAR_MODE_OPTIONS.map((mode) => {
              const window = modeWindow(mode.value, parsed.query.start);
              const active = parsed.query.mode === mode.value;

              return (
                <Link
                  key={mode.value}
                  href={`/rent-a-car/search${toQueryString({
                    city: parsed.query.city,
                    start: window.start,
                    end: window.end,
                    mode: mode.value,
                  })}`}
                  aria-current={active ? "true" : undefined}
                  className={
                    active
                      ? "rounded-full bg-brand-700 px-3 py-1.5 text-[11px] font-extrabold text-white"
                      : "rounded-full border border-brand-200 bg-surface px-3 py-1.5 text-[11px] font-bold text-brand-800 transition-colors hover:bg-brand-100"
                  }
                >
                  {mode.label}
                </Link>
              );
            })}
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-brand-600" />
              300 km/day included · GST shown at review
            </span>
          </div>
        </div>
      ) : null}

      {!parsed.hasCity && !parsed.error ? (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="featured-cars-search-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Start here</p>
                <h2
                  id="featured-cars-search-heading"
                  className="mt-2 text-2xl leading-tight sm:text-3xl"
                >
                  Pick a city, then pick the car.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  The catalogue covers twelve cities. Until you choose one, here are four guest
                  favourites from across the fleet.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">
                <Sparkles aria-hidden="true" className="size-3.5 text-gold-600" />
                {allCars.length} demo cars
              </span>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {featured.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  query={{
                    start: parsed.query.start,
                    end: parsed.query.end,
                    days: parsed.query.days,
                    mode: parsed.query.mode,
                  }}
                  cityName={cityByCode.get(car.city_code)?.name}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="car-search-cities-heading">
            <div>
              <p className="eyebrow">Pick-up cities</p>
              <h2
                id="car-search-cities-heading"
                className="mt-2 text-2xl leading-tight sm:text-3xl"
              >
                Where are you driving?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Each city carries a small, specific slice of the fleet. Choosing one keeps your
                dates and plan.
              </p>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((option) => {
                const count = allCars.filter((car) => car.city_code === option.code).length;
                return (
                  <Link
                    key={option.code}
                    href={`/rent-a-car/search${toQueryString({
                      city: option.code,
                      start: parsed.query.start,
                      end: parsed.query.end,
                      mode: parsed.query.mode,
                    })}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50/60"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                        {option.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-muted-soft">
                        {count} {count === 1 ? "car" : "cars"} · from{" "}
                        {formatCurrency(
                          allCars
                            .filter((car) => car.city_code === option.code)
                            .reduce(
                              (minimum, car) => Math.min(minimum, car.price_per_hour),
                              Number.POSITIVE_INFINITY,
                            ),
                        )}
                        /hr
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {parsed.hasCity && !parsed.error ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block" aria-label="Car filters">
            <div className="sticky top-28 rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <CarFilters facets={facets} query={parsed.query} />
            </div>
          </aside>

          <section aria-labelledby="car-results-heading">
            <h2 id="car-results-heading" className="sr-only">
              Car results
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">
                <span className="text-lg font-extrabold">{results.length}</span>{" "}
                {results.length === 1 ? "car" : "cars"}
                <span className="font-normal text-muted">
                  {city ? ` in ${city.name}` : " on this search"}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <MobileFilterDrawer
                  title="Filter cars"
                  activeCount={filterChips.length}
                  className="lg:hidden"
                >
                  <CarFilters facets={facets} query={parsed.query} />
                </MobileFilterDrawer>
                <SortSelect
                  value={parsed.query.sort}
                  options={CAR_SORT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <div className="mt-3">
              <ActiveFilters
                filters={filterChips}
                clearKeys={[
                  "budget",
                  "type",
                  "transmission",
                  "fuel",
                  "seats",
                  "rating",
                  "year",
                  "distance",
                  "fastag",
                  "delivery",
                ]}
              />
            </div>

            {results.length > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {results.map((car, index) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      query={{
                        start: parsed.query.start,
                        end: parsed.query.end,
                        days: parsed.query.days,
                        mode: parsed.query.mode,
                      }}
                      cityName={city?.name}
                      priority={index === 0}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-muted-soft">
                  Card totals cover the rental and 18% GST for the selected window. Home delivery,
                  add-ons, and the refundable deposit are shown on the car page and at review. No
                  car is held and no payment is taken.
                </p>
              </>
            ) : cityCars.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="No demo cars in that city yet."
                description="The fleet covers twelve cities. Pick another pick-up city above, or browse the guest favourites."
                actions={
                  <Link
                    href="/rent-a-car"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    Browse featured cars
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                }
              />
            ) : (
              <EmptyState
                className="mt-4"
                title="No cars match those filters."
                description="Loosen a filter or reset them to see the full city again. Your city, dates, and rental plan will stay as they are."
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
