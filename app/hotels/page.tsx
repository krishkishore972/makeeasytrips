import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  MapPin,
  Plane,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { HotelCard } from "@/components/hotels/hotel-card";
import { HotelFilters } from "@/components/hotels/hotel-filters";
import { HotelSearchForm } from "@/components/hotels/hotel-search-form";
import { HotelsPageSkeleton } from "@/components/hotels/hotel-skeletons";
import { ActiveFilters, type ActiveFilterChip } from "@/components/search/active-filters";
import { MobileFilterDrawer } from "@/components/search/mobile-filter-drawer";
import { SortSelect } from "@/components/search/sort-select";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort, formatGuestLabel, formatNightLabel } from "@/lib/dates";
import { buildHotelFacets, getHotelCities, getHotels, searchHotels } from "@/lib/data/hotels";
import {
  AMENITY_FILTER_OPTIONS,
  HOTEL_SORT_OPTIONS,
  PRICE_BAND_OPTIONS,
} from "@/lib/search-options";
import { parseHotelSearchParams, parseStayParams } from "@/lib/validation/search";
import { formatCurrency, toQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Find character-led demo stays across India with honest nightly rates, clear amenities, and flexible cancellation details.",
  alternates: {
    canonical: "/hotels",
  },
};

type HotelsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function HotelsPage({ searchParams }: HotelsPageProps) {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Hotels" }]} />

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Stays</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
                A place that feels like the trip.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                City boltholes, coastal hideaways, and slow courtyard stays. Every property, rate,
                and review below is fictional demo inventory.
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              <Plane aria-hidden="true" className="size-4 text-brand-600" />
              Still need a flight?
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <Suspense fallback={<HotelsPageSkeleton />}>
          <HotelsExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function HotelsExperience({ searchParams }: HotelsPageProps) {
  await connection();
  const params = await searchParams;
  const parsed = parseHotelSearchParams(params);
  const stay = parseStayParams(params);

  const [cities, allHotels] = await Promise.all([getHotelCities(), getHotels()]);
  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const city = parsed.query.city ? cityByCode.get(parsed.query.city) : undefined;

  const cityHotels = parsed.query.city
    ? allHotels.filter((hotel) => hotel.city_code === parsed.query.city)
    : [];
  const facets = buildHotelFacets(cityHotels);
  const results = parsed.hasCity && !parsed.error ? await searchHotels(parsed.query) : [];

  const featuredHotels: typeof allHotels = [];
  const featuredImages = new Set<string>();
  for (const hotel of allHotels
    .filter((candidate) => candidate.featured)
    .sort((a, b) => b.guest_rating - a.guest_rating || a.price_per_night - b.price_per_night)) {
    if (featuredImages.has(hotel.image)) continue;
    featuredImages.add(hotel.image);
    featuredHotels.push(hotel);
    if (featuredHotels.length === 4) break;
  }

  const cityStats = new Map<string, { count: number; minPrice: number }>();
  for (const hotel of allHotels) {
    const existing = cityStats.get(hotel.city_code);
    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, hotel.price_per_night);
    } else {
      cityStats.set(hotel.city_code, {
        count: 1,
        minPrice: hotel.price_per_night,
      });
    }
  }

  const stayQuery = {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: parsed.query.rooms,
    guests: parsed.query.guests,
  };

  const baseHref = `/hotels${toQueryString({
    city: parsed.query.city,
    checkin: stay.checkIn,
    checkout: stay.checkOut,
    rooms: parsed.query.rooms,
    guests: parsed.query.guests,
  })}`;

  const filterChips: ActiveFilterChip[] = [
    ...parsed.query.priceBands.map((band) => ({
      key: "price",
      value: band,
      label: PRICE_BAND_OPTIONS.find((option) => option.value === band)?.label ?? band,
      mode: "list" as const,
    })),
    ...parsed.query.stars.map((star) => ({
      key: "stars",
      value: String(star),
      label: `${star}-star`,
      mode: "list" as const,
    })),
    ...(parsed.query.minRating !== null
      ? [
          {
            key: "rating",
            value: String(parsed.query.minRating),
            label: `Guest rating ${parsed.query.minRating}+`,
            mode: "value" as const,
          },
        ]
      : []),
    ...parsed.query.amenities.map((amenity) => ({
      key: "amenities",
      value: amenity,
      label: AMENITY_FILTER_OPTIONS.find((option) => option.value === amenity)?.label ?? amenity,
      mode: "list" as const,
    })),
    ...(parsed.query.breakfastOnly
      ? [{ key: "breakfast", label: "Breakfast included", mode: "value" as const }]
      : []),
    ...(parsed.query.cancellationOnly
      ? [{ key: "cancel", label: "Free cancellation", mode: "value" as const }]
      : []),
  ];

  const initial = {
    city: parsed.query.city ?? "",
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: parsed.query.rooms,
    guests: parsed.query.guests,
  };

  return (
    <>
      <HotelSearchForm cities={cities} initial={initial} />

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
            href="/hotels"
            className="inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-4"
          >
            Start over
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {parsed.hasCity && !parsed.error ? (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-brand-900">
                <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                {city?.name ?? parsed.query.city}
                <span className="font-mono text-[11px] text-brand-600">{parsed.query.city}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {formatDateShort(stay.checkIn)} → {formatDateShort(stay.checkOut)} ·{" "}
                {formatNightLabel(stay.nights)} ·{" "}
                {formatGuestLabel(parsed.query.rooms, parsed.query.guests)}
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
          <p className="mt-2 border-t border-brand-100 pt-2 text-[11px] leading-5 text-muted">
            Rates are per room, per night. Taxes are estimated from the property&apos;s demo rate
            and shown in the stay total.
          </p>
        </div>
      ) : null}

      {!parsed.hasCity && !parsed.error ? (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="featured-stays-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Guest favourites</p>
                <h2 id="featured-stays-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
                  Stays we would book ourselves.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  Four fictional properties with the strongest guest notes. Pick a city above to see
                  the full catalogue and filter by what matters.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">
                <Sparkles aria-hidden="true" className="size-3.5 text-gold-600" />
                {featuredHotels.length} featured
              </span>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {featuredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  query={stayQuery}
                  nights={stay.nights}
                  cityName={cityByCode.get(hotel.city_code)?.name}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="stay-cities-heading">
            <div>
              <p className="eyebrow">Where to stay</p>
              <h2 id="stay-cities-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
                Eight cities, eight moods.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                The demo catalogue covers a small, deliberate set of cities. Each one has four
                properties chosen for a different kind of trip.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((option) => {
                const stats = cityStats.get(option.code);
                return (
                  <Link
                    key={option.code}
                    href={`/hotels${toQueryString({
                      city: option.code,
                      checkin: stay.checkIn,
                      checkout: stay.checkOut,
                      rooms: parsed.query.rooms,
                      guests: parsed.query.guests,
                    })}`}
                    className="group card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <BedDouble aria-hidden="true" className="size-4 text-brand-600" />
                        {option.name}
                      </p>
                      <span className="font-mono text-[10px] font-bold text-muted-soft">
                        {option.code}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-muted">{option.tagline}</p>
                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-soft">
                          {stats?.count ?? 0} stays · from
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

      {parsed.hasCity && !parsed.error ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block" aria-label="Hotel filters">
            <div className="sticky top-28 rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <HotelFilters facets={facets} query={parsed.query} />
            </div>
          </aside>

          <section aria-labelledby="hotel-results-heading">
            <h2 id="hotel-results-heading" className="sr-only">
              Hotel results
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">
                <span className="text-lg font-extrabold">{results.length}</span>{" "}
                {results.length === 1 ? "stay" : "stays"}
                <span className="font-normal text-muted">
                  {city ? ` in ${city.name}` : " on this search"}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <MobileFilterDrawer
                  title="Filter stays"
                  activeCount={filterChips.length}
                  className="lg:hidden"
                >
                  <HotelFilters facets={facets} query={parsed.query} />
                </MobileFilterDrawer>
                <SortSelect
                  value={parsed.query.sort}
                  options={HOTEL_SORT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <div className="mt-3">
              <ActiveFilters
                filters={filterChips}
                clearKeys={["price", "stars", "rating", "amenities", "breakfast", "cancel"]}
              />
            </div>

            {results.length > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {results.map((hotel, index) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      query={stayQuery}
                      nights={stay.nights}
                      cityName={city?.name}
                      priority={index === 0}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-muted-soft">
                  Nightly rates, taxes, guest scores, and availability are part of the mock
                  catalogue. No room is held and no payment is taken.
                </p>
              </>
            ) : cityHotels.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="No demo stays in that city yet."
                description="The hotel catalogue currently covers eight cities. Try one of the cities above, or search again."
                actions={
                  <Link
                    href="/hotels"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
                  >
                    Browse featured stays
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                }
              />
            ) : (
              <EmptyState
                className="mt-4"
                title="No stays match those filters."
                description="Loosen a filter or reset them to see the full city again. Your dates, rooms, and guests will stay as they are."
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
