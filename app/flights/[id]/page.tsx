import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  Leaf,
  MapPin,
  Plane,
  ShieldCheck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import { AirlineMark } from "@/components/flights/airline-mark";
import { FlightCard } from "@/components/flights/flight-card";
import { FlightDetailSkeleton } from "@/components/flights/flight-skeletons";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatDateLong, formatDuration } from "@/lib/dates";
import { getCityMap } from "@/lib/data/cities";
import { fareFor, getFlightById, getOtherRouteFlights } from "@/lib/data/flights";
import { flightFareBreakdown } from "@/lib/pricing";
import { CABIN_OPTIONS } from "@/lib/search-options";
import { parseFlightSearchParams } from "@/lib/validation/search";
import { formatCurrency, toQueryString } from "@/lib/utils";

type FlightDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: FlightDetailProps): Promise<Metadata> {
  const { id } = await params;
  const flight = await getFlightById(id);

  if (!flight) {
    return { title: "Flight not found" };
  }

  return {
    title: `${flight.airline} ${flight.from_code} → ${flight.to_code}`,
    description: `Demo flight ${flight.flight_number} from ${flight.from_code} to ${flight.to_code}, ${formatDuration(flight.duration_minutes)}, from ${formatCurrency(flight.fare_economy)}.`,
    alternates: {
      canonical: `/flights/${flight.id}`,
    },
  };
}

export default function FlightDetailPage(props: FlightDetailProps) {
  return (
    <Suspense fallback={<FlightDetailSkeleton />}>
      <FlightDetailContent {...props} />
    </Suspense>
  );
}

async function FlightDetailContent({ params, searchParams }: FlightDetailProps) {
  await connection();
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const flight = await getFlightById(id);

  if (!flight) {
    notFound();
  }

  const parsed = parseFlightSearchParams(raw);
  const cityMap = await getCityMap();
  const origin = cityMap.get(flight.from_code);
  const destination = cityMap.get(flight.to_code);

  const cabin = parsed.query.cabin;
  const pax = parsed.query.pax;
  const fare = fareFor(flight, cabin);
  const breakdown = flightFareBreakdown(fare, pax);
  const departDate = parsed.query.depart ?? "";
  const arriveDate = flight.arrive_day_offset
    ? new Date(new Date(`${departDate}T12:00:00Z`).getTime() + 86_400_000)
        .toISOString()
        .slice(0, 10)
    : departDate;
  const cabinLabel = CABIN_OPTIONS.find((option) => option.value === cabin)?.label ?? "Economy";
  const others = (await getOtherRouteFlights(flight, cabin, 3)).map((result) => ({
    ...result,
    totalFare: result.fare * pax,
  }));

  const cardQuery = {
    ...parsed.query,
    from: flight.from_code,
    to: flight.to_code,
    depart: departDate,
  };

  const backHref = `/flights${toQueryString({
    from: flight.from_code,
    to: flight.to_code,
    depart: departDate,
    return: parsed.query.returnDate,
    pax,
    cabin,
  })}`;

  const facts = [
    {
      icon: Briefcase,
      label: "Check-in baggage",
      value: `${flight.baggage_checkin} kg`,
    },
    {
      icon: Briefcase,
      label: "Cabin baggage",
      value: `${flight.baggage_cabin} kg`,
    },
    {
      icon: Clock3,
      label: "On-time performance",
      value: `${flight.on_time}%`,
    },
    {
      icon: Leaf,
      label: "Estimated emissions",
      value: `${flight.carbon_kg} kg CO₂`,
    },
    {
      icon: UtensilsCrossed,
      label: "Meal",
      value: flight.meal_included ? "Included" : "Buy on board",
    },
    {
      icon: Plane,
      label: "Aircraft",
      value: flight.aircraft,
    },
  ];

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs
            items={[
              { label: "Flights", href: "/flights" },
              { label: `${flight.from_code} → ${flight.to_code}` },
            ]}
          />

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AirlineMark code={flight.airline_code} />
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
                  {flight.airline} · {flight.flight_number} · {flight.fare_brand}
                </p>
                <h1 className="mt-1 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05]">
                  {origin?.name ?? flight.from_code} → {destination?.name ?? flight.to_code}
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  {formatDateLong(departDate)}
                  <span aria-hidden="true">·</span>
                  {cabinLabel}
                  <span aria-hidden="true">·</span>
                  {pax} {pax === 1 ? "traveller" : "travellers"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-800">
                {flight.stops === 0
                  ? "Nonstop"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.via ? ` · via ${flight.via}` : ""}`}
              </span>
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                Back to results
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-4">
            <article className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
              <h2 className="text-2xl leading-tight">Your flight</h2>

              <div className="mt-5 flex gap-4">
                <div aria-hidden="true" className="flex flex-col items-center pt-1.5">
                  <span className="size-3 rounded-full border-2 border-brand-600 bg-surface" />
                  <span className="my-1 w-px flex-1 bg-line-strong" />
                  <span className="size-3 rounded-full bg-brand-600" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <p className="text-lg font-extrabold text-ink">
                      {flight.depart_time} · {flight.from_code}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      {origin?.name} · {origin?.airport}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-soft">{formatDateLong(departDate)}</p>
                  </div>

                  <div className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-[11px] font-semibold text-muted">
                    {formatDuration(flight.duration_minutes)} ·{" "}
                    {flight.stops === 0 ? "Nonstop" : `1 stop via ${flight.via}`} ·{" "}
                    {flight.aircraft}
                  </div>

                  <div>
                    <p className="text-lg font-extrabold text-ink">
                      {flight.arrive_time}
                      {flight.arrive_day_offset > 0 ? (
                        <sup className="ml-0.5 align-super text-[10px] text-accent-600">+1</sup>
                      ) : null}{" "}
                      · {flight.to_code}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      {destination?.name} · {destination?.airport}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-soft">{formatDateLong(arriveDate)}</p>
                  </div>
                </div>
              </div>

              <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.label}>
                      <dt className="flex items-center gap-2.5 text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        {fact.label}
                      </dt>
                      <dd className="mt-1 pl-[2.625rem] text-xs font-bold text-ink">
                        {fact.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>

            <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
              <h2 className="text-2xl leading-tight">Fare rules, in plain language.</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Demo policies for the {flight.fare_brand} fare. They are intentionally simple and do
                not represent a real airline contract.
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                <li className="flex gap-2.5 rounded-xl border border-line bg-canvas p-3">
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${flight.refundable ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
                  >
                    {flight.refundable ? (
                      <Check aria-hidden="true" className="size-3" />
                    ) : (
                      <X aria-hidden="true" className="size-3" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">
                      {flight.refundable ? "Refundable fare" : "Non-refundable fare"}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      {flight.refundable
                        ? "Cancel up to 24 hours before departure for a full demo refund, minus a ₹500 handling fee."
                        : "Fare is non-refundable after booking. Taxes may be refundable under the demo policy."}
                    </p>
                  </div>
                </li>

                <li className="flex gap-2.5 rounded-xl border border-line bg-canvas p-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <CalendarDays aria-hidden="true" className="size-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">Changes</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      {flight.refundable
                        ? "Date changes are free up to 24 hours before departure; fare difference may apply."
                        : "Date changes cost ₹3,000 plus any fare difference, up to 24 hours before departure."}
                    </p>
                  </div>
                </li>

                <li className="flex gap-2.5 rounded-xl border border-line bg-canvas p-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Briefcase aria-hidden="true" className="size-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">Baggage</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      {flight.baggage_checkin} kg check-in and {flight.baggage_cabin} kg cabin
                      baggage are included. Extra baggage can be added later in the demo flow.
                    </p>
                  </div>
                </li>

                <li className="flex gap-2.5 rounded-xl border border-line bg-canvas p-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <UtensilsCrossed aria-hidden="true" className="size-3" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">Seats and meals</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Standard seats are assigned at check-in.{" "}
                      {flight.meal_included
                        ? "A meal is included in this fare."
                        : "Meals can be purchased on board."}
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            {others.length > 0 ? (
              <section aria-labelledby="other-flights-heading" className="pt-2">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Same route</p>
                    <h2 id="other-flights-heading" className="mt-2 text-2xl leading-tight">
                      Other departures.
                    </h2>
                  </div>
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
                  >
                    See all flights
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {others.map((result) => (
                    <FlightCard
                      key={result.flight.id}
                      result={result}
                      query={cardQuery}
                      fromCity={origin?.name}
                      toCity={destination?.name}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <p className="eyebrow">Fare summary</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-ink">{formatCurrency(fare)}</span>
                <span className="text-xs font-semibold text-muted">/ traveller</span>
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {cabinLabel} · {flight.fare_brand} fare
              </p>

              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">
                    Base fare × {pax} {pax === 1 ? "traveller" : "travellers"}
                  </dt>
                  <dd className="font-bold text-ink">{formatCurrency(breakdown.base)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Taxes and fees</dt>
                  <dd className="font-bold text-ink">{formatCurrency(breakdown.taxes)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
                  <dt className="text-sm font-extrabold text-ink">Total</dt>
                  <dd className="text-lg font-extrabold text-ink">
                    {formatCurrency(breakdown.total)}
                  </dd>
                </div>
              </dl>

              <EnquiryDialog
                target={{
                  service: "flight",
                  title: `${flight.from_code} → ${flight.to_code} · ${flight.airline} ${flight.flight_number}`,
                  context: [
                    `Departure: ${formatDateLong(departDate)}`,
                    `Travellers: ${pax}`,
                    `Cabin: ${cabinLabel}`,
                  ],
                }}
                label="Enquire about this flight"
                className="mt-4 w-full"
              />

              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500"
                />
                Share your details and enquiry directly with our business WhatsApp.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.1em] text-brand-800 uppercase">
                <MapPin aria-hidden="true" className="size-3.5" />
                {flight.from_code} → {flight.to_code}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {origin?.name} to {destination?.name} in {formatDuration(flight.duration_minutes)}.{" "}
                {flight.stops === 0
                  ? "A direct demo service."
                  : `One stop in ${flight.via ?? "a connecting city"}.`}
              </p>
              <Link
                href="/info/how-it-works"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
              >
                How demo fares work
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
