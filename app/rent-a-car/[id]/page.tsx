import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CarFront,
  Check,
  Clock3,
  Fuel,
  Gauge,
  KeyRound,
  MapPin,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UsersRound,
} from "lucide-react";
import { CarBookingPanel } from "@/components/cars/car-booking-panel";
import { CarCard } from "@/components/cars/car-card";
import { CarGallery } from "@/components/cars/car-gallery";
import { CarDetailSkeleton } from "@/components/cars/car-skeletons";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatDateTimeLong, formatRentalDuration } from "@/lib/dates";
import { getCarById, getSimilarCars } from "@/lib/data/cars";
import { getCity } from "@/lib/data/cities";
import type { Car } from "@/lib/data/schemas";
import { carRentalBreakdown } from "@/lib/pricing";
import { CAR_ADDON_OPTIONS, CAR_KM_PLAN_OPTIONS } from "@/lib/search-options";
import { formatCurrency } from "@/lib/utils";
import { parseRentalParams } from "@/lib/validation/search";

type CarDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    return {
      title: "Car not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${car.brand} ${car.model} · Rent a car`,
    description: `${car.tagline} ${car.year} ${car.model} ${car.variant} in ${car.city_code}, from ${formatCurrency(
      car.price_per_hour,
    )} per hour. Fictional self-drive demo listing.`,
    alternates: {
      canonical: `/rent-a-car/${car.id}`,
    },
    openGraph: {
      title: `${car.brand} ${car.model} · TripNest`,
      description: car.description,
      images: [{ url: car.image, width: 800, height: 500, alt: car.tagline }],
    },
  };
}

const POLICIES = [
  {
    title: "Fuel policy",
    detail:
      "Handover and return at the same fuel level. Fuel is not included in the demo price, and the difference is settled at return in a real rental.",
  },
  {
    title: "Kilometres",
    detail:
      "Every day includes 300 km. Extra distance is billed at ₹12 per kilometre. Unlimited kilometres can be added for ₹399 per day.",
  },
  {
    title: "Cancellation",
    detail:
      "Free cancellation until 24 hours before pick-up, then 50% of the rental in this illustrative policy. No money is ever charged here.",
  },
  {
    title: "Security deposit",
    detail:
      "A refundable deposit is authorised at pick-up and released after the car is returned. The demo shows the amount but never collects it.",
  },
];

function reviewHighlights(car: Car) {
  const base = [
    {
      title: "Clean and ready",
      detail: `The ${car.model} was washed, fuelled, and waiting at the handover point.`,
      author: "Demo guest · Bengaluru",
    },
    {
      title: "Easy handover",
      detail: `${car.host_name} walked through the controls and the FASTag before the drive.`,
      author: "Demo guest · Mumbai",
    },
    {
      title: "Good for the highway",
      detail: `The ${car.transmission.toLowerCase()} gearbox and ${car.fuel.toLowerCase()} engine handled a long weekend well.`,
      author: "Demo guest · Pune",
    },
  ];

  return car.rating >= 4.6 ? base : base.slice(0, 2);
}

export default function CarDetailPage({ params, searchParams }: CarDetailPageProps) {
  return (
    <Suspense fallback={<CarDetailSkeleton />}>
      <CarDetailExperience params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CarDetailExperience({ params, searchParams }: CarDetailPageProps) {
  await connection();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const car = await getCarById(id);

  if (!car) notFound();

  const rental = parseRentalParams(query);
  const city = await getCity(car.city_code);
  const similar = await getSimilarCars(car, 3);
  const cityName = city?.name ?? car.city_code;

  const price = carRentalBreakdown(car.price_per_hour, {
    days: rental.days,
    kmPlanExtraPerDay: 0,
    delivery: false,
    deliveryFee: car.delivery_fee,
    addons: [],
    deposit: car.deposit,
  });

  const specs = [
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuel },
    { icon: UsersRound, label: "Seats", value: `${car.seats} seats` },
    { icon: Gauge, label: "Included", value: `${car.km_limit_per_day} km/day` },
    { icon: CarFront, label: "Body style", value: car.car_type },
    { icon: CalendarClock, label: "Model year", value: String(car.year) },
  ];

  const reviews = reviewHighlights(car);

  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="page-container py-3">
          <Breadcrumbs
            items={[
              { label: "Rent a car", href: "/rent-a-car" },
              { label: cityName, href: `/rent-a-car/search?city=${car.city_code}` },
              { label: `${car.brand} ${car.model}` },
            ]}
          />
        </div>
      </div>

      <div className="page-container py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{car.brand}</p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.03]">
              {car.model} <span className="text-muted-soft">{car.variant}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Star aria-hidden="true" className="size-4 fill-gold-500 text-gold-500" />
                <span className="font-extrabold text-ink">{car.rating.toFixed(1)}</span>
                <span>({car.review_count} demo reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                {cityName} · {car.distance_km} km from the centre
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck aria-hidden="true" className="size-4 text-brand-600" />
                {car.host_type} host
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {car.guest_favorite ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1.5 text-[11px] font-extrabold text-brand-950">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Guest favourite
              </span>
            ) : null}
            {car.home_delivery ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-800">
                <Truck aria-hidden="true" className="size-3.5" />
                Home delivery
              </span>
            ) : null}
            {car.fastag ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-3 py-1.5 text-[11px] font-extrabold text-success">
                <Route aria-hidden="true" className="size-3.5" />
                FASTag active
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-5">
            <CarGallery images={[car.image]} name={`${car.brand} ${car.model}`} city={cityName} />

            <section
              aria-labelledby="car-overview-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="car-overview-heading" className="text-xl leading-tight">
                    About this car
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-brand-700">{car.tagline}</p>
                </div>
                <span className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[10px] font-extrabold text-muted">
                  {car.year} · {car.car_type}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted">{car.description}</p>

              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <li
                      key={spec.label}
                      className="flex items-center gap-2.5 rounded-xl bg-canvas px-3 py-2.5"
                    >
                      <Icon aria-hidden="true" className="size-4 shrink-0 text-brand-600" />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-extrabold tracking-[0.08em] text-muted-soft uppercase">
                          {spec.label}
                        </span>
                        <span className="block text-xs font-bold text-ink">{spec.value}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section
              aria-labelledby="car-plans-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <h2 id="car-plans-heading" className="text-xl leading-tight">
                Kilometres and extras
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                The base rate includes {car.km_limit_per_day} km a day. Choose unlimited kilometres
                when the route is longer, and add the extras you actually need at review.
              </p>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {CAR_KM_PLAN_OPTIONS.map((option) => (
                  <div key={option.value} className="rounded-xl border border-line bg-canvas p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-extrabold text-ink">{option.label}</p>
                      <span className="text-[10px] font-extrabold text-brand-700">
                        {option.extraPerDay === 0
                          ? "Included"
                          : `+${formatCurrency(option.extraPerDay)}/day`}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-muted">{option.detail}</p>
                  </div>
                ))}
              </div>

              <ul className="mt-4 space-y-2 border-t border-line pt-4">
                {CAR_ADDON_OPTIONS.map((option) => {
                  const fitted = option.value === "fastag" && car.fastag;
                  return (
                    <li key={option.value} className="flex items-start gap-2.5">
                      {fitted ? (
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-brand-600"
                        />
                      )}
                      <span className="min-w-0 flex-1 text-xs leading-5 text-muted">
                        <span className="font-extrabold text-ink">{option.label}</span>
                        {fitted
                          ? " · already fitted"
                          : ` · ${formatCurrency(option.price)}${option.perDay ? " per day" : ""}`}
                        <span className="block text-[10px] text-muted-soft">{option.detail}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section
              aria-labelledby="car-host-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <h2 id="car-host-heading" className="text-xl leading-tight">
                Your host
              </h2>
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-700 text-lg font-extrabold text-white">
                  {car.host_name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-ink">
                    {car.host_name}
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-800">
                      <BadgeCheck aria-hidden="true" className="size-3" />
                      {car.host_type}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {car.host_type === "Professional"
                      ? "A demo rental operator with a small, maintained fleet. Handover is at a fixed point in the city."
                      : "A demo individual host sharing one car when it is not in use. Handover is arranged directly."}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="size-3.5 text-brand-600" />
                      {car.distance_km} km from {cityName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 aria-hidden="true" className="size-3.5 text-brand-600" />
                      Replies within a few hours
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="car-policies-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <h2 id="car-policies-heading" className="text-xl leading-tight">
                Policies, in plain words
              </h2>
              <div className="mt-3 divide-y divide-line">
                {POLICIES.map((policy) => (
                  <details key={policy.title} className="group py-1">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-extrabold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                      {policy.title}
                      <span
                        aria-hidden="true"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="pr-8 pb-4 text-xs leading-6 text-muted">{policy.detail}</p>
                  </details>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="car-reviews-heading"
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="car-reviews-heading" className="text-xl leading-tight">
                    What demo guests said
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Fictional review notes generated for this listing. No real guest wrote them.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-2.5 py-1.5 text-xs font-extrabold text-white">
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                  {car.rating.toFixed(1)}
                  <span className="font-semibold text-white/70">/ 5</span>
                </span>
              </div>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {reviews.map((review) => (
                  <li key={review.title} className="rounded-xl bg-canvas p-3.5">
                    <p
                      className="flex items-center gap-1 text-gold-600"
                      role="img"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} aria-hidden="true" className="size-3 fill-current" />
                      ))}
                    </p>
                    <p className="mt-2 text-xs font-extrabold text-ink">{review.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">{review.detail}</p>
                    <p className="mt-2 text-[10px] font-semibold text-muted-soft">
                      {review.author}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside aria-label="Car booking" className="lg:sticky lg:top-28">
            <CarBookingPanel car={car} initial={{ start: rental.start, end: rental.end }} />
            <div className="mt-3 rounded-xl border border-line bg-surface p-3.5 text-[10px] leading-5 text-muted">
              <p className="flex items-start gap-1.5">
                <KeyRound aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                Self-drive only. The demo does not verify licences, collect identity documents, or
                hold a car.
              </p>
              <p className="mt-2 flex items-start gap-1.5">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                />
                A {formatCurrency(car.deposit)} refundable deposit is shown but never charged.
              </p>
            </div>
          </aside>
        </div>

        <section aria-labelledby="similar-cars-heading" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Also consider</p>
              <h2 id="similar-cars-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
                Similar cars in the demo fleet.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Same city or body style where possible. Your dates carry across so the totals stay
                comparable.
              </p>
            </div>
            <Link
              href={`/rent-a-car/search?city=${car.city_code}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-brand-700 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50"
            >
              See all in {cityName}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {similar.map((candidate) => (
              <CarCard
                key={candidate.id}
                car={candidate}
                query={{
                  start: rental.start,
                  end: rental.end,
                  days: rental.days,
                  mode: "daily",
                }}
                cityName={cityName}
              />
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-[11px] leading-5 text-muted">
            <span className="font-extrabold text-brand-900">Demo listing.</span> {car.brand}{" "}
            {car.model} specifications, host names, ratings, prices, and policies are fictional. The
            two-day estimate is {formatCurrency(price.total)} including 18% GST, for{" "}
            {formatRentalDuration(rental.hours)} from {formatDateTimeLong(rental.start)}. No vehicle
            is held, no payment is taken, and nothing is stored.
          </p>
        </div>
      </div>
    </>
  );
}
