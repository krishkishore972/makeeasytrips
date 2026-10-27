import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { HotelCard } from "@/components/hotels/hotel-card";
import { HotelGallery } from "@/components/hotels/hotel-gallery";
import { HotelDetailSkeleton } from "@/components/hotels/hotel-skeletons";
import { AmenityIcon } from "@/components/shared/amenity-icon";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RatingBadge, StarRating } from "@/components/shared/rating";
import { formatDateLong, formatGuestLabel, formatNightLabel } from "@/lib/dates";
import { getCity } from "@/lib/data/cities";
import { getHotelById, getHotelsByCity } from "@/lib/data/hotels";
import { hotelStayBreakdown } from "@/lib/pricing";
import { AMENITY_LABELS } from "@/lib/search-options";
import { parseStayParams } from "@/lib/validation/search";
import { formatCurrency, toQueryString } from "@/lib/utils";

type HotelDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: HotelDetailProps): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotelById(id);

  if (!hotel) {
    return { title: "Stay not found" };
  }

  return {
    title: `${hotel.name}, ${hotel.area}`,
    description: `${hotel.tagline} A fictional ${hotel.property_type.toLowerCase()} in ${hotel.area}, with demo rates from ${formatCurrency(hotel.price_per_night)} per night.`,
    alternates: {
      canonical: `/hotels/${hotel.id}`,
    },
  };
}

export default function HotelDetailPage(props: HotelDetailProps) {
  return (
    <Suspense fallback={<HotelDetailSkeleton />}>
      <HotelDetailContent {...props} />
    </Suspense>
  );
}

function galleryFor(image: string) {
  const match = image.match(/stay-(\d)\.svg$/);
  const start = Number(match?.[1] ?? "1");

  return [0, 1, 2].map((offset) => `/images/stays/stay-${((start - 1 + offset) % 6) + 1}.svg`);
}

async function HotelDetailContent({ params, searchParams }: HotelDetailProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  await connection();

  const hotel = await getHotelById(id);
  if (!hotel) notFound();

  const stay = parseStayParams(raw);
  const [city, cityHotels] = await Promise.all([
    getCity(hotel.city_code),
    getHotelsByCity(hotel.city_code),
  ]);

  const others = cityHotels.filter((candidate) => candidate.id !== hotel.id).slice(0, 2);
  const gallery = galleryFor(hotel.image);
  const price = hotelStayBreakdown(
    hotel.price_per_night,
    stay.nights,
    stay.rooms,
    hotel.tax_percent,
  );

  const flexPerNight = hotel.price_per_night + 900;
  const flexPrice = hotelStayBreakdown(flexPerNight, stay.nights, stay.rooms, hotel.tax_percent);

  const plans = [
    {
      id: "saver",
      name: hotel.room_type,
      tagline: "The room as listed, with the property's standard inclusions.",
      perNight: hotel.price_per_night,
      total: price.total,
      breakfast: hotel.breakfast,
      cancellation: hotel.free_cancellation,
      badge: "Best value",
      perk: "Standard check-in and check-out",
    },
    {
      id: "flex",
      name: `${hotel.room_type} · Flex`,
      tagline: "A more forgiving rate for plans that may move.",
      perNight: flexPerNight,
      total: flexPrice.total,
      breakfast: true,
      cancellation: true,
      badge: "Most flexible",
      perk: "Late checkout until 2 pm, subject to availability",
    },
  ];

  const policies = [
    {
      title: "Check-in and check-out",
      body: `Check-in from ${hotel.check_in} and check-out by ${hotel.check_out}. Early check-in and late checkout are subject to availability; the Flex rate includes a 2 pm checkout request.`,
    },
    {
      title: "Cancellation",
      body: hotel.free_cancellation
        ? "Free cancellation until 24 hours before check-in on the listed rate. After that, the first night is charged. The Flex rate keeps the same window and adds a late-checkout request."
        : "This rate is non-refundable after booking. The Flex rate adds free cancellation until 24 hours before check-in, minus a ₹500 demo handling fee.",
    },
    {
      title: "Taxes and fees",
      body: `The stay total includes ${hotel.tax_percent}% demo taxes on the room subtotal. No resort fee, service charge, or payment is collected in this learning project.`,
    },
    {
      title: "House rules",
      body: "Quiet hours are 10 pm to 7 am. Pets are welcome only where the amenity list says so. Outside food is fine in the room; the restaurant asks for advance notice for large groups.",
    },
  ];

  const backHref = `/hotels${toQueryString({
    city: hotel.city_code,
    checkin: stay.checkIn,
    checkout: stay.checkOut,
    rooms: stay.rooms,
    guests: stay.guests,
  })}`;

  const staySummary = `${formatDateLong(stay.checkIn)} → ${formatDateLong(stay.checkOut)} · ${formatNightLabel(stay.nights)} · ${formatGuestLabel(stay.rooms, stay.guests)}`;

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs
            items={[
              { label: "Hotels", href: "/hotels" },
              ...(city
                ? [
                    {
                      label: city.name,
                      href: `/hotels${toQueryString({
                        city: city.code,
                        checkin: stay.checkIn,
                        checkout: stay.checkOut,
                        rooms: stay.rooms,
                        guests: stay.guests,
                      })}`,
                    },
                  ]
                : []),
              { label: hotel.name },
            ]}
          />

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={hotel.star_rating} />
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-800">
                  {hotel.property_type}
                </span>
                {hotel.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-extrabold text-gold-600">
                    <Sparkles aria-hidden="true" className="size-3" />
                    Guest favourite
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]">{hotel.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                  {hotel.area}
                  {city ? `, ${city.name}` : ""}
                </span>
                <span aria-hidden="true">·</span>
                {hotel.distance_km} km from the centre
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  {staySummary}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RatingBadge score={hotel.guest_rating} reviewCount={hotel.review_count} />
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                Back to stays
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-4">
            <HotelGallery images={gallery} name={hotel.name} area={hotel.area} />

            <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
              <p className="eyebrow">The stay</p>
              <h2 className="mt-2 text-2xl leading-tight">{hotel.tagline}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{hotel.description}</p>

              <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Guest score
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-lg font-extrabold text-ink">
                    <Star aria-hidden="true" className="size-4 fill-gold-500 text-gold-500" />
                    {hotel.guest_rating.toFixed(1)}
                    <span className="text-[10px] font-semibold text-muted">/ 10</span>
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Rooms
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <BedDouble aria-hidden="true" className="size-4 text-brand-600" />
                    {hotel.room_type}
                  </p>
                </div>
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                    Check-in
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <Clock3 aria-hidden="true" className="size-4 text-brand-600" />
                    From {hotel.check_in}
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="amenities-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">In the room, on the property</p>
                  <h2 id="amenities-heading" className="mt-2 text-2xl leading-tight">
                    What is included.
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-muted">
                  {hotel.amenities.length} amenities
                </span>
              </div>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {hotel.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs font-bold text-ink-soft"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-brand-700 shadow-xs">
                      <AmenityIcon amenity={amenity} className="size-4" />
                    </span>
                    {AMENITY_LABELS[amenity] ?? amenity}
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="rooms-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <p className="eyebrow">Choose a rate</p>
              <h2 id="rooms-heading" className="mt-2 text-2xl leading-tight">
                Rooms and meal plans.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Two demo rate plans, both priced for {formatNightLabel(stay.nights)} and{" "}
                {stay.rooms === 1 ? "one room" : `${stay.rooms} rooms`}. Nothing is held or charged.
              </p>

              <ul className="mt-5 space-y-3">
                {plans.map((plan) => (
                  <li
                    key={plan.id}
                    className="rounded-2xl border border-line bg-canvas p-4 transition-colors hover:border-brand-200"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-ink">{plan.name}</h3>
                          <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {plan.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted">{plan.tagline}</p>

                        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold">
                          <li
                            className={`inline-flex items-center gap-1.5 ${plan.breakfast ? "text-success" : "text-muted-soft"}`}
                          >
                            {plan.breakfast ? (
                              <Check aria-hidden="true" className="size-3.5" />
                            ) : (
                              <X aria-hidden="true" className="size-3.5" />
                            )}
                            {plan.breakfast ? "Breakfast included" : "Room only"}
                          </li>
                          <li
                            className={`inline-flex items-center gap-1.5 ${plan.cancellation ? "text-success" : "text-muted-soft"}`}
                          >
                            {plan.cancellation ? (
                              <Check aria-hidden="true" className="size-3.5" />
                            ) : (
                              <X aria-hidden="true" className="size-3.5" />
                            )}
                            {plan.cancellation ? "Free cancellation" : "Non-refundable"}
                          </li>
                          <li className="inline-flex items-center gap-1.5 text-muted">
                            <Sparkles aria-hidden="true" className="size-3.5 text-gold-600" />
                            {plan.perk}
                          </li>
                        </ul>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="flex items-baseline gap-1.5 sm:justify-end">
                          <span className="text-xl font-extrabold text-ink">
                            {formatCurrency(plan.perNight)}
                          </span>
                          <span className="text-[10px] font-semibold text-muted">/ night</span>
                        </p>
                        <p className="text-[10px] leading-4 text-muted-soft">
                          {formatCurrency(plan.total)} total incl. taxes
                        </p>
                        <Link
                          href={`/booking/review${toQueryString({
                            type: "hotel",
                            id: hotel.id,
                            checkin: stay.checkIn,
                            checkout: stay.checkOut,
                            rooms: stay.rooms,
                            guests: stay.guests,
                            plan: plan.id,
                          })}`}
                          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
                        >
                          Choose this rate
                          <ArrowRight aria-hidden="true" className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="policies-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <p className="eyebrow">Before you book</p>
              <h2 id="policies-heading" className="mt-2 text-2xl leading-tight">
                The fine print, without the fog.
              </h2>

              <div className="mt-4 divide-y divide-line">
                {policies.map((policy) => (
                  <details key={policy.title} className="group py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink">
                      {policy.title}
                      <span
                        aria-hidden="true"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 pr-8 text-xs leading-6 text-muted">{policy.body}</p>
                  </details>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="location-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">The neighbourhood</p>
                  <h2 id="location-heading" className="mt-2 text-2xl leading-tight">
                    {hotel.area}, {city?.name ?? hotel.city_code}.
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-800">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  {hotel.distance_km} km from centre
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
                <div className="relative h-44 bg-[radial-gradient(circle_at_30%_30%,var(--color-brand-100),transparent_55%),radial-gradient(circle_at_75%_65%,var(--color-accent-100),transparent_50%)]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 [background-image:linear-gradient(to_right,var(--color-brand-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-100)_1px,transparent_1px)] [background-size:2.5rem_2.5rem] opacity-60"
                  />
                  <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <span className="grid size-11 place-items-center rounded-full bg-brand-700 text-white shadow-md">
                      <MapPin aria-hidden="true" className="size-5" />
                    </span>
                    <span className="mt-2 rounded-full bg-surface px-2.5 py-1 text-[10px] font-extrabold text-ink shadow-xs">
                      {hotel.area}
                    </span>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-bold text-muted backdrop-blur">
                    Illustrative map · not to scale
                  </span>
                </div>
                <div className="grid gap-3 border-t border-brand-100 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                      Nearest airport
                    </p>
                    <p className="mt-1 text-xs font-bold text-ink">
                      {city?.airport ?? "City airport"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                      Getting around
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {city?.description ?? "A compact demo neighbourhood."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {others.length > 0 ? (
              <section aria-labelledby="other-stays-heading" className="pt-2">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Same city</p>
                    <h2 id="other-stays-heading" className="mt-2 text-2xl leading-tight">
                      Other stays worth a look.
                    </h2>
                  </div>
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
                  >
                    See all stays
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {others.map((other) => (
                    <HotelCard
                      key={other.id}
                      hotel={other}
                      query={{
                        checkIn: stay.checkIn,
                        checkOut: stay.checkOut,
                        rooms: stay.rooms,
                        guests: stay.guests,
                      }}
                      nights={stay.nights}
                      cityName={city?.name}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <p className="eyebrow">Your stay</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-ink">
                  {formatCurrency(hotel.price_per_night)}
                </span>
                <span className="text-xs font-semibold text-muted">/ night</span>
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {hotel.room_type} · {hotel.property_type}
              </p>

              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {formatNightLabel(stay.nights)} × {stay.rooms}{" "}
                    {stay.rooms === 1 ? "room" : "rooms"}
                  </dt>
                  <dd className="font-bold text-ink">{formatCurrency(price.base)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <UsersRound aria-hidden="true" className="size-3.5" />
                    {stay.guests} {stay.guests === 1 ? "guest" : "guests"}
                  </dt>
                  <dd className="font-bold text-ink">Included</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Taxes ({hotel.tax_percent}%)</dt>
                  <dd className="font-bold text-ink">{formatCurrency(price.taxes)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
                  <dt className="text-sm font-extrabold text-ink">Stay total</dt>
                  <dd className="text-lg font-extrabold text-ink">{formatCurrency(price.total)}</dd>
                </div>
              </dl>

              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[10px] leading-4 text-muted">
                {formatDateLong(stay.checkIn)} → {formatDateLong(stay.checkOut)}
              </p>

              <Link
                href={`/booking/review${toQueryString({
                  type: "hotel",
                  id: hotel.id,
                  checkin: stay.checkIn,
                  checkout: stay.checkOut,
                  rooms: stay.rooms,
                  guests: stay.guests,
                  plan: "saver",
                })}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
              >
                Reserve this stay
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>

              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500"
                />
                Demo only. No payment, account, or room hold is created.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.1em] text-brand-800 uppercase">
                <Coffee aria-hidden="true" className="size-3.5" />
                Good to know
              </p>
              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted">
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  Check-in from {hotel.check_in}, check-out by {hotel.check_out}.
                </li>
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  {hotel.breakfast
                    ? "Breakfast is included in the listed rate."
                    : "Breakfast can be added with the Flex rate."}
                </li>
                <li className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                  {hotel.free_cancellation
                    ? "Free cancellation until 24 hours before check-in."
                    : "The listed rate is non-refundable; Flex adds cancellation."}
                </li>
              </ul>
              <Link
                href="/info/how-it-works"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
              >
                How demo stays work
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
