import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Star } from "lucide-react";
import { formatDateShort } from "@/lib/dates";
import type { Holiday } from "@/lib/data/schemas";
import { holidayPriceBreakdown } from "@/lib/pricing";
import { HOLIDAY_THEME_LABELS } from "@/lib/search-options";
import { formatCurrency } from "@/lib/utils";

type HolidayCardProps = {
  holiday: Holiday;
  travellers: number;
  cityName?: string;
  priority?: boolean;
};

export function HolidayCard({ holiday, travellers, cityName, priority }: HolidayCardProps) {
  const href = `/holidays/${holiday.slug}`;
  const price = holidayPriceBreakdown(holiday.price_per_person, travellers);
  const visibleThemes = holiday.themes.slice(0, 3);
  const nextDeparture = holiday.departure_dates[0];

  return (
    <article className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
        <Image
          src={holiday.image}
          alt={`Illustration of ${holiday.title}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22rem, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
          <CalendarDays aria-hidden="true" className="size-3" />
          {holiday.days}D / {holiday.nights}N
        </span>
        {holiday.featured ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-extrabold text-brand-950 shadow-xs">
            <Sparkles aria-hidden="true" className="size-3" />
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <ul className="flex flex-wrap gap-1.5" aria-label="Trip themes">
          {visibleThemes.map((theme) => (
            <li
              key={theme}
              className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-extrabold text-brand-800"
            >
              {HOLIDAY_THEME_LABELS[theme] ?? theme}
            </li>
          ))}
        </ul>

        <h3 className="mt-2 text-xl leading-tight">
          <Link href={href} className="transition-colors hover:text-brand-700">
            {holiday.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-muted-soft" />
          {cityName ? `${cityName}, ` : ""}
          {holiday.country}
        </p>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{holiday.summary}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-ink">
            <Star aria-hidden="true" className="size-3.5 fill-gold-500 text-gold-500" />
            {holiday.rating.toFixed(1)}
            <span className="font-semibold text-muted-soft">
              ({holiday.review_count.toLocaleString("en-IN")})
            </span>
          </span>
          {nextDeparture ? (
            <span className="text-[11px] font-semibold text-muted">
              Next departure {formatDateShort(nextDeparture)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="text-xl leading-none font-extrabold text-ink">
                {formatCurrency(holiday.price_per_person)}
              </span>
              <span className="text-[10px] font-semibold text-muted">/ person</span>
            </p>
            <p className="mt-1 text-[10px] leading-4 text-muted-soft">
              {formatCurrency(price.total)} for {travellers}{" "}
              {travellers === 1 ? "traveller" : "travellers"} incl. taxes
            </p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            View itinerary
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
