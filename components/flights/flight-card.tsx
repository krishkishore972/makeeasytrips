import Link from "next/link";
import { ArrowRight, Briefcase, Clock3, Leaf, UtensilsCrossed } from "lucide-react";
import { AirlineMark } from "@/components/flights/airline-mark";
import type { FlightQuery, FlightResult } from "@/lib/data/flights";
import { formatCurrency, toQueryString } from "@/lib/utils";
import { formatDuration } from "@/lib/dates";

type FlightCardProps = {
  result: FlightResult;
  query: FlightQuery;
  fromCity?: string;
  toCity?: string;
};

export function FlightCard({ result, query, fromCity, toCity }: FlightCardProps) {
  const { flight, fare, totalFare } = result;
  const detailHref = `/flights/${flight.id}${toQueryString({
    from: query.from,
    to: query.to,
    depart: query.depart,
    return: query.returnDate,
    pax: query.pax,
    cabin: query.cabin,
  })}`;

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 shadow-xs transition-shadow hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <AirlineMark code={flight.airline_code} />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-ink">{flight.airline}</p>
              <p className="text-[11px] text-muted">
                {flight.flight_number} · {flight.aircraft}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-extrabold text-brand-800">
              {flight.stops === 0
                ? "Nonstop"
                : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.via ? ` · via ${flight.via}` : ""}`}
            </span>
            {flight.refundable ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[10px] font-extrabold text-success">
                Refundable
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3 sm:gap-5">
            <div className="shrink-0 text-left">
              <time
                dateTime={`${query.depart ?? ""}T${flight.depart_time}`}
                className="block text-xl leading-none font-extrabold text-ink sm:text-2xl"
              >
                {flight.depart_time}
              </time>
              <p className="mt-1 text-[11px] font-bold text-muted">
                {flight.from_code}
                {fromCity ? (
                  <span className="hidden font-normal sm:inline"> · {fromCity}</span>
                ) : null}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-center text-[11px] font-bold text-muted">
                {formatDuration(flight.duration_minutes)}
              </p>
              <div className="relative my-2 h-px bg-line-strong">
                <span className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 rounded-full bg-brand-500" />
                {flight.stops > 0 ? (
                  <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500" />
                ) : null}
                <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-brand-500" />
              </div>
              <p className="text-center text-[10px] text-muted-soft">
                {flight.stops === 0 ? "Direct flight" : `Via ${flight.via ?? "one stop"}`}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <time
                dateTime={`${query.depart ?? ""}T${flight.arrive_time}`}
                className="block text-xl leading-none font-extrabold text-ink sm:text-2xl"
              >
                {flight.arrive_time}
                {flight.arrive_day_offset > 0 ? (
                  <sup className="ml-0.5 align-super text-[10px] font-bold text-accent-600">+1</sup>
                ) : null}
              </time>
              <p className="mt-1 text-[11px] font-bold text-muted">
                {flight.to_code}
                {toCity ? <span className="hidden font-normal sm:inline"> · {toCity}</span> : null}
              </p>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Briefcase aria-hidden="true" className="size-3.5 text-muted-soft" />
              {flight.baggage_checkin} kg check-in
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="size-3.5 text-muted-soft" />
              {flight.on_time}% on time
            </li>
            {flight.meal_included ? (
              <li className="inline-flex items-center gap-1.5">
                <UtensilsCrossed aria-hidden="true" className="size-3.5 text-muted-soft" />
                Meal included
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1.5">
              <Leaf aria-hidden="true" className="size-3.5 text-muted-soft" />
              {flight.carbon_kg} kg CO₂
            </li>
          </ul>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-line pt-3 lg:w-48 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
          <div className="lg:text-right">
            <p className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
              {flight.seats_left <= 5 ? `Only ${flight.seats_left} seats left` : "From"}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{formatCurrency(fare)}</p>
            <p className="text-[10px] leading-4 text-muted">per traveller · incl. taxes</p>
            {query.pax > 1 ? (
              <p className="text-[10px] leading-4 text-muted-soft">
                {formatCurrency(totalFare)} for {query.pax}
              </p>
            ) : null}
          </div>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            View fare
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
