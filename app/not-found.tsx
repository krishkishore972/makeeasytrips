import Link from "next/link";
import { ArrowRight, Compass, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-8 text-center shadow-xs sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Compass aria-hidden="true" className="size-8" />
        </span>
        <p className="eyebrow mt-6">404 · Off the map</p>
        <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)]">This route is not on the itinerary.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
          The page you were looking for does not exist yet. It may be part of a later phase, or the
          link may have taken a wrong turn.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            Back to home
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/#destinations"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            <MapPin aria-hidden="true" className="size-4" />
            Browse destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
