import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import type { HomeDestination } from "@/lib/data/home";
import { formatCurrency } from "@/lib/utils";

type DestinationCardProps = {
  destination: HomeDestination;
  priority?: boolean;
};

export function DestinationCard({ destination, priority }: DestinationCardProps) {
  const { city, holiday, packageCount, minPrice, image } = destination;
  const href = `/holidays?destination=${city.code}`;

  return (
    <Link
      href={href}
      className="group card-hover relative block h-full overflow-hidden rounded-2xl border border-line bg-brand-950"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={image}
          alt={`Abstract illustration of ${city.name}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent"
        />

        <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full border border-white/15 bg-brand-950/50 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
          <Star aria-hidden="true" className="size-3 fill-gold-500 text-gold-500" />
          {holiday.rating.toFixed(1)}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-white/60 uppercase">
            <MapPin aria-hidden="true" className="size-3" />
            {city.state}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{city.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">{city.tagline}</p>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-3">
            <div>
              <span className="block text-[10px] font-semibold text-white/75">From</span>
              <span className="text-base font-extrabold text-white">
                {formatCurrency(minPrice)}
              </span>
              <span className="text-[10px] text-white/75"> / person</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80 transition-colors group-hover:text-white">
              {packageCount} {packageCount === 1 ? "trip" : "trips"}
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
