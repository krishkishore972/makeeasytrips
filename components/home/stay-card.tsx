import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, MapPin, Sparkles } from "lucide-react";
import { RatingBadge, StarRating } from "@/components/shared/rating";
import type { HomeStay } from "@/lib/data/home";
import { formatCurrency } from "@/lib/utils";

type StayCardProps = {
  stay: HomeStay;
  priority?: boolean;
};

export function StayCard({ stay, priority }: StayCardProps) {
  const { hotel, cityName } = stay;
  const href = `/hotels/${hotel.id}`;

  return (
    <article className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
      <div className="relative aspect-[16/11] overflow-hidden bg-brand-50">
        <Image
          src={hotel.image}
          alt={`Illustration of ${hotel.name} in ${hotel.area}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <StarRating rating={hotel.star_rating} />
            <h3 className="mt-1 text-lg leading-tight">
              <Link href={href} className="transition-colors hover:text-brand-700">
                {hotel.name}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-muted-soft" />
              {cityName} · {hotel.area}
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

        {hotel.breakfast ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-success">
            <Coffee aria-hidden="true" className="size-3" />
            Breakfast included
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="text-xl leading-none font-extrabold text-ink">
                {formatCurrency(hotel.price_per_night)}
              </span>
              <span className="text-[10px] font-semibold text-muted">/ night</span>
            </p>
            <p className="mt-1 text-[10px] leading-4 text-muted-soft">
              {hotel.free_cancellation
                ? "Free cancellation on demo rates"
                : "Demo rate before taxes"}
            </p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            View stay
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
