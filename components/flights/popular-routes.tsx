import Link from "next/link";
import { ArrowRight, Clock3, Plane } from "lucide-react";
import type { PopularRoute } from "@/lib/data/flights";
import { formatDuration } from "@/lib/dates";
import { formatCurrency, toQueryString } from "@/lib/utils";

type PopularRoutesProps = {
  routes: PopularRoute[];
  depart: string;
};

export function PopularRoutes({ routes, depart }: PopularRoutesProps) {
  return (
    <section aria-labelledby="popular-routes-heading" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Start somewhere</p>
          <h2 id="popular-routes-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
            Popular demo routes.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Six short-haul pairings with live demo inventory. Pick one to see fares, filters, and
            the full fare rules.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">
          <Plane aria-hidden="true" className="size-3.5 text-brand-500" />
          {routes.length} routes
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={`${route.from.code}-${route.to.code}`}
            href={`/flights${toQueryString({
              from: route.from.code,
              to: route.to.code,
              depart,
              pax: 1,
              cabin: "economy",
            })}`}
            className="group card-hover flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
                {route.from.code}
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 text-muted-soft transition-transform group-hover:translate-x-0.5"
                />
                {route.to.code}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-soft">
                <Clock3 aria-hidden="true" className="size-3" />
                {formatDuration(route.durationMinutes)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {route.from.name} → {route.to.name}
            </p>
            <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-soft">From</p>
                <p className="text-lg font-extrabold text-ink">{formatCurrency(route.fare)}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700">
                See flights
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
