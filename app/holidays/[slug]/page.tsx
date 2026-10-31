import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { HolidayBookingPanel } from "@/components/holidays/holiday-booking-panel";
import { HolidayCard } from "@/components/holidays/holiday-card";
import { HolidayGallery } from "@/components/holidays/holiday-gallery";
import { HolidayItinerary } from "@/components/holidays/holiday-itinerary";
import { HolidayDetailSkeleton } from "@/components/holidays/holiday-skeletons";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatDateShort } from "@/lib/dates";
import { getCities, getCity } from "@/lib/data/cities";
import { getHolidayBySlug, getSimilarHolidays } from "@/lib/data/holidays";
import { holidayPriceBreakdown } from "@/lib/pricing";
import { HOLIDAY_THEME_LABELS } from "@/lib/search-options";
import { parseHolidaySearchParams } from "@/lib/validation/search";
import { firstParam, formatCurrency, toQueryString } from "@/lib/utils";

type HolidayDetailProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: HolidayDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const holiday = await getHolidayBySlug(slug);

  if (!holiday) {
    return { title: "Holiday package not found" };
  }

  return {
    title: `${holiday.title} · ${holiday.days} days`,
    description: `${holiday.summary} A fictional ${holiday.days}-day demo package from ${formatCurrency(holiday.price_per_person)} per person.`,
    alternates: {
      canonical: `/holidays/${holiday.slug}`,
    },
  };
}

export default function HolidayDetailPage(props: HolidayDetailProps) {
  return (
    <Suspense fallback={<HolidayDetailSkeleton />}>
      <HolidayDetailContent {...props} />
    </Suspense>
  );
}

async function HolidayDetailContent({ params, searchParams }: HolidayDetailProps) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  await connection();

  const holiday = await getHolidayBySlug(slug);
  if (!holiday) notFound();

  const parsed = parseHolidaySearchParams(raw);
  const travellers = parsed.query.travellers;
  const requestedDeparture = firstParam(raw.depart);
  const departure =
    requestedDeparture && holiday.departure_dates.includes(requestedDeparture)
      ? requestedDeparture
      : (holiday.departure_dates[0] ?? "");

  const [city, similar, cities] = await Promise.all([
    getCity(holiday.city_code),
    getSimilarHolidays(holiday, 3),
    getCities(),
  ]);
  const cityNameByCode = new Map(cities.map((entry) => [entry.code, entry.name]));

  const price = holidayPriceBreakdown(holiday.price_per_person, travellers);
  const backHref = `/holidays${toQueryString({
    destination: city?.code,
    travellers: travellers !== 2 ? travellers : null,
  })}`;
  const nextDeparture = holiday.departure_dates[0];

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs
            items={[
              { label: "Holidays", href: "/holidays" },
              ...(city
                ? [
                    {
                      label: city.name,
                      href: `/holidays${toQueryString({ destination: city.code })}`,
                    },
                  ]
                : []),
              { label: holiday.title },
            ]}
          />

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {holiday.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-800"
                  >
                    {HOLIDAY_THEME_LABELS[theme] ?? theme}
                  </span>
                ))}
                {holiday.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-extrabold text-gold-600">
                    <Sparkles aria-hidden="true" className="size-3" />
                    Featured
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]">{holiday.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                  {city ? `${city.name}, ` : ""}
                  {holiday.country}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  {holiday.days} days / {holiday.nights} nights
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <UsersRound aria-hidden="true" className="size-3.5" />
                  {travellers} {travellers === 1 ? "traveller" : "travellers"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1.5 text-xs font-extrabold text-gold-600">
                <Star aria-hidden="true" className="size-3.5 fill-current" />
                {holiday.rating.toFixed(1)}
                <span className="font-semibold text-muted">
                  ({holiday.review_count.toLocaleString("en-IN")} reviews)
                </span>
              </span>
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                Back to packages
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-4">
            <HolidayGallery images={holiday.gallery} title={holiday.title} />

            <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
              <p className="eyebrow">The trip</p>
              <h2 className="mt-2 text-2xl leading-tight">
                A slower way through {city?.name ?? holiday.country}.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{holiday.summary}</p>

              <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Duration
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <CalendarDays aria-hidden="true" className="size-4 text-brand-600" />
                    {holiday.days} days / {holiday.nights} nights
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Best for
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <Compass aria-hidden="true" className="size-4 text-brand-600" />
                    {holiday.themes
                      .slice(0, 2)
                      .map((theme) => HOLIDAY_THEME_LABELS[theme] ?? theme)
                      .join(" · ")}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Next departure
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <Sparkles aria-hidden="true" className="size-4 text-gold-600" />
                    {nextDeparture ? formatDateShort(nextDeparture) : "On request"}
                  </p>
                </div>
              </div>

              <h3 className="mt-6 text-sm font-extrabold tracking-[0.1em] text-ink uppercase">
                Trip highlights
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {holiday.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs leading-5 font-semibold text-ink-soft"
                  >
                    <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>

            <HolidayItinerary
              itinerary={holiday.itinerary}
              days={holiday.days}
              nights={holiday.nights}
            />

            <section
              aria-labelledby="inclusions-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <p className="eyebrow">What is in the price</p>
              <h2 id="inclusions-heading" className="mt-2 text-2xl leading-tight">
                Inclusions and exclusions.
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-success-soft p-4">
                  <h3 className="text-sm font-extrabold text-success">Included</h3>
                  <ul className="mt-2.5 space-y-2">
                    {holiday.inclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-5 text-ink-soft"
                      >
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0 text-success"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-canvas p-4">
                  <h3 className="text-sm font-extrabold text-muted">Not included</h3>
                  <ul className="mt-2.5 space-y-2">
                    {holiday.exclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-5 text-muted"
                      >
                        <X
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0 text-muted-soft"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="holiday-notes-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <p className="eyebrow">Before you go</p>
              <h2 id="holiday-notes-heading" className="mt-2 text-2xl leading-tight">
                The small print, in plain language.
              </h2>

              <div className="mt-4 divide-y divide-line">
                <details className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink">
                    How the per-person price works
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2 pr-8 text-xs leading-6 text-muted">
                    The published price is per person on twin sharing. The demo total multiplies
                    that price by {travellers} {travellers === 1 ? "traveller" : "travellers"} and
                    adds 5% demo taxes and fees. A single supplement is not modelled.
                  </p>
                </details>
                <details className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink">
                    Are transfers included?
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2 pr-8 text-xs leading-6 text-muted">
                    Only when the inclusion list says so. The itinerary assumes you arrive on day
                    one and leave on the final day. Airport and station transfers are listed
                    separately for each package, and a self-drive car can be added for the days
                    between.
                  </p>
                </details>
                <details className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink">
                    What happens when I choose a date?
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2 pr-8 text-xs leading-6 text-muted">
                    The departure buttons update the demo summary and total. Choosing one opens a
                    mock review, and confirming creates a demo reference only. Nothing is held, no
                    account is created, and no payment is taken.
                  </p>
                </details>
              </div>
            </section>

            {similar.length > 0 ? (
              <section aria-labelledby="similar-holidays-heading" className="pt-2">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Same mood, different map</p>
                    <h2 id="similar-holidays-heading" className="mt-2 text-2xl leading-tight">
                      If this trip is not quite it.
                    </h2>
                  </div>
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
                  >
                    See all packages
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {similar.map((candidate) => (
                    <HolidayCard
                      key={candidate.id}
                      holiday={candidate}
                      travellers={travellers}
                      cityName={cityNameByCode.get(candidate.city_code)}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <HolidayBookingPanel
              title={holiday.title}
              pricePerPerson={holiday.price_per_person}
              departures={holiday.departure_dates}
              initialDeparture={departure}
              initialTravellers={travellers}
              cityName={city?.name ?? holiday.country}
            />

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.1em] text-brand-800 uppercase">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Good to know
              </p>
              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  {formatCurrency(price.total)} total for {travellers}{" "}
                  {travellers === 1 ? "traveller" : "travellers"}, including demo taxes.
                </li>
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  The departure list and every inclusion are fictional demo content.
                </li>
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  No card, account, or booking is created in this learning project.
                </li>
              </ul>
              <Link
                href="/info/how-it-works"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
              >
                How demo holidays work
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
