import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CarFront,
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
  UsersRound,
  Wallet,
} from "lucide-react";
import { CarSearchForm } from "@/components/cars/car-search-form";
import { CarCard } from "@/components/cars/car-card";
import { CarsLandingSkeleton } from "@/components/cars/car-skeletons";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Faq } from "@/components/home/faq";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  addDaysISO,
  addHoursToISODateTime,
  defaultRentalEnd,
  defaultRentalStart,
  isMonday,
} from "@/lib/dates";
import { getCarCities, getCarCityStats, getCars, getFeaturedCars } from "@/lib/data/cars";
import type { HomeFaq } from "@/lib/home-content";
import { CAR_MODE_OPTIONS, CAR_TYPE_OPTIONS, type CarMode } from "@/lib/search-options";
import { formatCompactNumber, formatCurrency, toQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rent a car",
  description:
    "Choose a self-drive car from a fictional Indian fleet. Compare daily, weekly, and weekday plans by city, transmission, fuel, seats, and kilometre allowance.",
  alternates: {
    canonical: "/rent-a-car",
  },
};

const HOW_IT_WORKS = [
  {
    icon: MapPin,
    title: "Pick a city and a window",
    detail:
      "Choose where you are driving and the exact pick-up and drop-off times. The demo prices in 24-hour blocks.",
  },
  {
    icon: CarFront,
    title: "Compare the actual car",
    detail:
      "Each listing is a specific model and year, not a vague category. Check transmission, fuel, seats, and distance.",
  },
  {
    icon: KeyRound,
    title: "Choose a kilometre plan",
    detail:
      "Every rental includes 300 km a day. Add unlimited kilometres when the route is longer than the plan.",
  },
  {
    icon: Route,
    title: "Review, then hit the road",
    detail:
      "The mock review step shows the full split: rental, delivery, add-ons, GST, and the refundable deposit.",
  },
];

const RENTAL_FAQS: HomeFaq[] = [
  {
    question: "What does self-drive mean here?",
    answer:
      "You drive the car yourself. There is no chauffeur, no driver allowance, and no per-kilometre fare. The demo booking covers the car, the chosen kilometre plan, and any delivery or add-ons you select.",
  },
  {
    question: "How is the trip total calculated?",
    answer:
      "The hourly rate is converted to a 24-hour day rate. A 30-hour rental is billed as two days. The total adds the kilometre plan, home delivery if chosen, add-ons, and 18% GST. The refundable security deposit is shown separately.",
  },
  {
    question: "What is the difference between the plans?",
    answer:
      "Daily Drives covers short trips. Subscription is for rentals of seven days or more. Weekday Pass starts on a Monday and covers at least five days, which suits a work week in one city.",
  },
  {
    question: "Is fuel included?",
    answer:
      "No. The demo assumes the car is handed over with a set fuel level and returned at the same level. Fuel, tolls, parking, and traffic fines are the driver's responsibility in this fictional flow.",
  },
  {
    question: "Is a deposit charged?",
    answer:
      "Each listing shows a refundable deposit. It is displayed in the price summary but never collected. No payment, verification, or real reservation happens in this learning project.",
  },
  {
    question: "Can I cancel a demo rental?",
    answer:
      "Cancellation rules are shown on each car page so you can compare them. They are illustrative only. Nothing is stored, so there is no booking to cancel after you leave the confirmation screen.",
  },
];

function modeWindow(mode: CarMode) {
  const base = defaultRentalStart();

  if (mode === "subscription") {
    return { start: base, end: addHoursToISODateTime(base, 24 * 8) };
  }

  if (mode === "weekday") {
    let start = base;
    for (let index = 0; index < 7; index += 1) {
      const candidate = `${addDaysISO(base.slice(0, 10), index)}T10:00`;
      if (isMonday(candidate.slice(0, 10))) {
        start = candidate;
        break;
      }
    }
    return { start, end: addHoursToISODateTime(start, 24 * 5) };
  }

  return { start: base, end: defaultRentalEnd(base) };
}

export default function RentACarPage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="page-container py-3">
          <Breadcrumbs items={[{ label: "Rent a car" }]} />
        </div>
      </div>

      <Suspense fallback={<CarsLandingSkeleton />}>
        <RentACarContent />
      </Suspense>
    </>
  );
}

async function RentACarContent() {
  await connection();
  const [cities, cars, featured, cityStats] = await Promise.all([
    getCarCities(),
    getCars(),
    getFeaturedCars(6),
    getCarCityStats(),
  ]);

  const defaultStart = defaultRentalStart();
  const defaultEnd = defaultRentalEnd(defaultStart);
  const defaultQuery = {
    start: defaultStart,
    end: defaultEnd,
    days: 2,
    mode: "daily" as CarMode,
  };

  const cityByCode = new Map(cities.map((city) => [city.code, city]));
  const typeCounts = new Map<string, number>();
  for (const car of cars) {
    typeCounts.set(car.car_type, (typeCounts.get(car.car_type) ?? 0) + 1);
  }

  const startingPrice = cars.reduce(
    (minimum, car) => Math.min(minimum, car.price_per_hour),
    Number.POSITIVE_INFINITY,
  );
  const averageRating =
    cars.reduce((total, car) => total + car.rating, 0) / Math.max(1, cars.length);

  const stats = [
    { value: formatCompactNumber(cars.length), label: "cars in the demo fleet" },
    { value: formatCompactNumber(cities.length), label: "pick-up cities" },
    { value: formatCurrency(startingPrice), label: "from, per hour" },
    { value: averageRating.toFixed(1), label: "average guest rating" },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-brand-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_80%_at_80%_0%,#0f766e_0%,transparent_60%),radial-gradient(50%_60%_at_10%_100%,#115e59_0%,transparent_55%)]"
        />
        <div className="page-container relative py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-brand-100 uppercase">
                <KeyRound aria-hidden="true" className="size-3.5" />
                Self-drive rentals
              </p>
              <h1 className="mt-4 max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.02] font-semibold text-white">
                Take the car. Leave the itinerary open.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
                Choose a specific car in a specific city, pick the hours you need, and see the whole
                trip total before you decide. Every car, host, and price is fictional demo
                inventory.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/80">
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck aria-hidden="true" className="size-4 text-brand-300" />
                  300 km included every day
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Wallet aria-hidden="true" className="size-4 text-brand-300" />
                  Refundable deposit shown upfront
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-4 text-brand-300" />
                  Hourly search, 24-hour billing
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-surface p-1 text-ink shadow-lg">
              <CarSearchForm
                cities={cities.map((city) => ({ code: city.code, name: city.name }))}
                initial={{
                  city: cities[0]?.code ?? "",
                  start: defaultStart,
                  end: defaultEnd,
                  mode: "daily",
                }}
                className="border-0 shadow-none"
              />
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[10px] font-extrabold tracking-[0.12em] text-white/50 uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="page-container space-y-14 py-10 sm:py-14">
        <section aria-labelledby="car-modes-heading">
          <SectionHeading
            eyebrow="Three ways to rent"
            title="A plan for the shape of the trip."
            description="Short weekend, a full week of work, or a long stay. The same fleet, priced around how long you actually need the car."
            titleClassName="text-[clamp(1.75rem,3.2vw,2.5rem)]"
          />

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {CAR_MODE_OPTIONS.map((mode, index) => {
              const window = modeWindow(mode.value);
              const href = `/rent-a-car/search${toQueryString({
                city: cities[0]?.code ?? null,
                start: window.start,
                end: window.end,
                mode: mode.value,
              })}`;

              return (
                <Link
                  key={mode.value}
                  href={href}
                  className="group card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      {index === 0 ? (
                        <CarFront aria-hidden="true" className="size-5" />
                      ) : index === 1 ? (
                        <CalendarCheck aria-hidden="true" className="size-5" />
                      ) : (
                        <Clock3 aria-hidden="true" className="size-5" />
                      )}
                    </span>
                    <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[10px] font-extrabold text-muted">
                      {mode.minimumDays === 1 ? "1 day minimum" : `${mode.minimumDays} day minimum`}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg leading-tight">{mode.label}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted">{mode.detail}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[11px] font-extrabold text-brand-700">
                    Search this plan
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="featured-cars-heading">
          <SectionHeading
            eyebrow="Guest favourites"
            title="Cars the demo guests keep coming back to."
            description="A mix of city hatchbacks, comfortable sedans, and SUVs for the long way round. Prices are hourly; the card shows the two-day trip total."
            action={{ label: "See all cars", href: "/rent-a-car/search" }}
            titleClassName="text-[clamp(1.75rem,3.2vw,2.5rem)]"
          />

          <div className="mt-6 grid gap-3 xl:grid-cols-2">
            {featured.slice(0, 4).map((car) => (
              <CarCard
                key={car.id}
                car={car}
                query={defaultQuery}
                cityName={cityByCode.get(car.city_code)?.name}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="car-types-heading">
          <SectionHeading
            eyebrow="Choose a shape"
            title="From a small hatchback to a seven-seat MPV."
            description="The catalogue spans six body styles. Pick the one that fits the people, the luggage, and the road."
            titleClassName="text-[clamp(1.75rem,3.2vw,2.5rem)]"
          />

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {CAR_TYPE_OPTIONS.map((option) => {
              const count = typeCounts.get(option.value) ?? 0;
              if (count === 0) return null;

              return (
                <Link
                  key={option.value}
                  href={`/rent-a-car/search${toQueryString({
                    city: cities[0]?.code ?? null,
                    start: defaultStart,
                    end: defaultEnd,
                    type: option.value,
                  })}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50/60"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-ink">{option.label}</span>
                    <span className="block text-[10px] font-semibold text-muted-soft">
                      {count} {count === 1 ? "model" : "models"} in the fleet
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

        <section aria-labelledby="car-cities-heading">
          <SectionHeading
            eyebrow="Pick-up cities"
            title="Twelve cities, one set of keys."
            description="Each city has its own small slice of the fleet. Choose a city to see what is actually available there, along with the distance from the city centre."
            titleClassName="text-[clamp(1.75rem,3.2vw,2.5rem)]"
          />

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city) => {
              const cityStat = cityStats.get(city.code);
              return (
                <Link
                  key={city.code}
                  href={`/rent-a-car/search${toQueryString({
                    city: city.code,
                    start: defaultStart,
                    end: defaultEnd,
                  })}`}
                  className="group card-hover flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                      <MapPin aria-hidden="true" className="size-4 text-brand-600" />
                      {city.name}
                    </p>
                    <span className="font-mono text-[10px] font-bold text-muted-soft">
                      {city.code}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{city.tagline}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-soft">
                        {cityStat?.count ?? 0} cars · from
                      </p>
                      <p className="text-sm font-extrabold text-ink">
                        {formatCurrency(cityStat?.minPrice ?? 0)}
                        <span className="text-[10px] font-semibold text-muted-soft">/hr</span>
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

        <section
          aria-labelledby="how-it-works-heading"
          className="rounded-3xl border border-line bg-surface p-6 shadow-xs sm:p-8"
        >
          <SectionHeading
            eyebrow="How it works"
            title="Four steps from search to keys."
            description="No account, no card, and no queue at a counter. The demo keeps the whole decision on one screen."
            titleClassName="text-[clamp(1.75rem,3.2vw,2.5rem)]"
          />

          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative rounded-2xl bg-canvas p-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-700 text-white">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="font-mono text-[11px] font-extrabold text-muted-soft">
                      0{index + 1}
                    </span>
                  </span>
                  <h3 className="mt-3 text-sm leading-snug font-extrabold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted">{step.detail}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-[11px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck aria-hidden="true" className="size-4 text-brand-600" />
              Professional hosts are marked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star aria-hidden="true" className="size-4 text-gold-600" />
              Guest favourite cars keep a 4.8+ score
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gauge aria-hidden="true" className="size-4 text-brand-600" />
              Unlimited km available on every car
            </span>
          </div>
        </section>

        <section
          aria-labelledby="car-faq-heading"
          className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
        >
          <SectionHeading
            eyebrow="Good to know"
            title="The small print, in plain words."
            description="Everything below applies to the fictional demo catalogue. No vehicle is held and no money changes hands."
            titleClassName="text-[clamp(1.5rem,2.6vw,2rem)]"
          />
          <Faq items={RENTAL_FAQS} />
        </section>

        <section className="overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
            <div>
              <p className="eyebrow">Have a car to share?</p>
              <h2 className="mt-2 text-[clamp(1.5rem,2.8vw,2.25rem)] leading-tight">
                List it for the days you are not driving.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                The host programme is a demo shell: no application is collected and no car is
                inspected. It exists so the product story is complete, with the same clear pricing
                and guest rules shown on every listing.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/info/list-your-property"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
                >
                  <Sparkles aria-hidden="true" className="size-4" />
                  See the host story
                </Link>
                <Link
                  href="/rent-a-car/search"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-surface px-4 py-2.5 text-xs font-bold text-brand-800 transition-colors hover:bg-brand-100"
                >
                  <CarFront aria-hidden="true" className="size-4" />
                  Browse the fleet
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-surface">
              <Image
                src="/images/booking/car.svg"
                alt="Illustration of a self-drive car with its keys"
                width={320}
                height={200}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="car-detail-heading" className="grid gap-4 sm:grid-cols-3">
          <h2 id="car-detail-heading" className="sr-only">
            What every listing shows
          </h2>
          {[
            {
              icon: Settings2,
              title: "The actual specification",
              detail:
                "Model, variant, year, transmission, fuel, and seats — not a mystery category.",
            },
            {
              icon: Fuel,
              title: "The running costs",
              detail:
                "Fuel policy, FASTag status, kilometre plan, and what happens past the limit.",
            },
            {
              icon: UsersRound,
              title: "The host and the handover",
              detail:
                "Who is hosting, whether delivery is available, and the distance from the centre.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-line bg-surface p-4">
                <span className="grid size-9 place-items-center rounded-xl bg-canvas text-brand-700">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted">{item.detail}</p>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
