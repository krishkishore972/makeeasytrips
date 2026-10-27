import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { AmenityIcon } from "@/components/shared/amenity-icon";
import { RatingBadge, StarRating } from "@/components/shared/rating";
import { formatNightLabel } from "@/lib/dates";
import type { HotelQuery } from "@/lib/data/hotels";
import type { Hotel } from "@/lib/data/schemas";
import { hotelStayBreakdown } from "@/lib/pricing";
import { AMENITY_LABELS } from "@/lib/search-options";
import { formatCurrency, toQueryString } from "@/lib/utils";

type HotelCardProps = {
  hotel: Hotel;
  query: Pick<HotelQuery, "checkIn" | "checkOut" | "rooms" | "guests">;
  nights: number;
  cityName?: string;
  priority?: boolean;
};

export function HotelCard({ hotel, query, nights, cityName, priority }: HotelCardProps) {
  const price = hotelStayBreakdown(hotel.price_per_night, nights, query.rooms, hotel.tax_percent);
  const detailHref = `/hotels/${hotel.id}${toQueryString({
    checkin: query.checkIn,
    checkout: query.checkOut,
    rooms: query.rooms,
    guests: query.guests,
  })}`;
  const visibleAmenities = hotel.amenities.slice(0, 5);
  const extraAmenities = hotel.amenities.length - visibleAmenities.length;

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-brand-50 sm:aspect-auto sm:w-60 lg:w-64">
          <Image
            src={hotel.image}
            alt={`Illustration of ${hotel.name} in ${hotel.area}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 15rem, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {hotel.featured ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-extrabold text-brand-950 shadow-xs">
              <Sparkles aria-hidden="true" className="size-3" />
              Guest favourite
            </span>
          ) : null}
          <span className="absolute bottom-3 left-3 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            {hotel.property_type}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={hotel.star_rating} />
                <span className="text-[10px] font-bold tracking-[0.08em] text-muted-soft uppercase">
                  {hotel.area}
                </span>
              </div>
              <h3 className="mt-1.5 text-xl leading-tight">
                <Link href={detailHref} className="transition-colors hover:text-brand-700">
                  {hotel.name}
                </Link>
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-muted-soft" />
                {cityName ? `${cityName} · ` : ""}
                {hotel.distance_km} km from the centre
              </p>
            </div>
            <RatingBadge
              score={hotel.guest_rating}
              reviewCount={hotel.review_count}
              size="sm"
              className="shrink-0"
            />
          </div>

          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{hotel.tagline}</p>

          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Amenities">
            {visibleAmenities.map((amenity) => (
              <li
                key={amenity}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft"
              >
                <AmenityIcon amenity={amenity} className="size-3.5 text-brand-600" />
                {AMENITY_LABELS[amenity] ?? amenity}
              </li>
            ))}
            {extraAmenities > 0 ? (
              <li className="text-[11px] font-bold text-muted-soft">+{extraAmenities} more</li>
            ) : null}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {hotel.breakfast ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[10px] font-extrabold text-success">
                <Coffee aria-hidden="true" className="size-3" />
                Breakfast included
              </span>
            ) : null}
            {hotel.free_cancellation ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-extrabold text-brand-800">
                <ShieldCheck aria-hidden="true" className="size-3" />
                Free cancellation
              </span>
            ) : null}
            {hotel.guest_rating >= 9 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-1 text-[10px] font-extrabold text-gold-600">
                <Star aria-hidden="true" className="size-3 fill-current" />
                Highly rated
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="text-2xl leading-none font-extrabold text-ink">
                  {formatCurrency(hotel.price_per_night)}
                </span>
                <span className="text-[11px] font-semibold text-muted">/ night</span>
              </p>
              <p className="mt-1 text-[10px] leading-4 text-muted-soft">
                {formatCurrency(price.total)} total · {formatNightLabel(nights)} ·{" "}
                {hotel.tax_percent}% taxes
              </p>
            </div>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              View rooms
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
