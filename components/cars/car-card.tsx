import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Fuel,
  Gauge,
  MapPin,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import type { Car } from "@/lib/data/schemas";
import { carRentalBreakdown } from "@/lib/pricing";
import type { CarMode } from "@/lib/search-options";
import { formatCurrency, toQueryString } from "@/lib/utils";

type CarCardProps = {
  car: Car;
  query: {
    start: string;
    end: string;
    days: number;
    mode: CarMode;
  };
  cityName?: string;
  priority?: boolean;
};

export function CarCard({ car, query, cityName, priority }: CarCardProps) {
  const price = carRentalBreakdown(car.price_per_hour, {
    days: query.days,
    kmPlanExtraPerDay: 0,
    delivery: false,
    deliveryFee: car.delivery_fee,
    addons: [],
    deposit: car.deposit,
  });
  const href = `/rent-a-car/${car.id}${toQueryString({
    start: query.start,
    end: query.end,
    mode: query.mode,
  })}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-brand-50 sm:aspect-auto sm:w-60 lg:w-64">
          <Image
            src={car.image}
            alt={`Abstract illustration of a ${car.brand} ${car.model}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 15rem, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {car.guest_favorite ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-extrabold text-brand-950 shadow-xs">
                <Sparkles aria-hidden="true" className="size-3" />
                Guest favourite
              </span>
            ) : null}
            {car.host_type === "Professional" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                <BadgeCheck aria-hidden="true" className="size-3" />
                Professional host
              </span>
            ) : null}
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-extrabold text-ink shadow-xs backdrop-blur">
            {car.year} · {car.car_type}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                {car.brand}
              </p>
              <h3 className="mt-0.5 text-xl leading-tight">
                <Link href={href} className="transition-colors hover:text-brand-700">
                  {car.model}
                </Link>
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden="true" className="size-3.5 text-muted-soft" />
                  {cityName ?? car.city_code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{car.distance_km} km away</span>
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-700 px-2 py-1 text-[11px] font-extrabold text-white">
              <Star aria-hidden="true" className="size-3 fill-current" />
              {car.rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{car.tagline}</p>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Car details">
            <li className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
              <Settings2 aria-hidden="true" className="size-3.5 text-brand-600" />
              {car.transmission}
            </li>
            <li className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
              <Fuel aria-hidden="true" className="size-3.5 text-brand-600" />
              {car.fuel}
            </li>
            <li className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
              <UsersRound aria-hidden="true" className="size-3.5 text-brand-600" />
              {car.seats} seats
            </li>
            <li className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
              <Gauge aria-hidden="true" className="size-3.5 text-brand-600" />
              {car.km_limit_per_day} km/day
            </li>
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {car.home_delivery ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-extrabold text-brand-800">
                <ShieldCheck aria-hidden="true" className="size-3" />
                Home delivery
              </span>
            ) : (
              <span className="rounded-full bg-canvas px-2 py-1 text-[10px] font-bold text-muted">
                Pick-up only
              </span>
            )}
            {car.fastag ? (
              <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-extrabold text-success">
                FASTag active
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="text-2xl leading-none font-extrabold text-ink">
                  {formatCurrency(car.price_per_hour)}
                </span>
                <span className="text-[11px] font-semibold text-muted">/ hour</span>
              </p>
              <p className="mt-1 text-[10px] leading-4 text-muted-soft">
                {formatCurrency(price.total)} for {query.days} {query.days === 1 ? "day" : "days"} ·
                excl. delivery
              </p>
            </div>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              View car
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
