import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "A demo wishlist for saving stays and holiday ideas. Nothing is stored and no account is needed.",
  alternates: {
    canonical: "/wishlist",
  },
};

const ideas = [
  {
    name: "Udaipur",
    note: "Lakeside heritage · 3 nights",
    href: "/holidays?destination=UDR",
  },
  {
    name: "Goa",
    note: "Slow coast · 4 nights",
    href: "/holidays?destination=GOI",
  },
  {
    name: "Ladakh",
    note: "High Himalaya · 6 nights",
    href: "/holidays?destination=IXL",
  },
] as const;

export default function WishlistPage() {
  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-xs sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-50 text-accent-600">
            <Heart aria-hidden="true" className="size-8" />
          </span>
          <p className="eyebrow mt-6">Saved for later</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.75rem)]">Your wishlist is waiting.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
            Saving arrives with the hotel and holiday detail pages. For now, start with one of these
            original demo ideas and imagine the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/#destinations"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              Browse destinations
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              See offers
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-muted uppercase">
            <Sparkles aria-hidden="true" className="size-3.5 text-gold-500" />
            Start a shortlist
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {ideas.map((idea) => (
              <li key={idea.href}>
                <Link
                  href={idea.href}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50"
                >
                  <span>
                    <span className="block text-sm font-extrabold text-ink">{idea.name}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                      <MapPin aria-hidden="true" className="size-3 text-brand-500" />
                      {idea.note}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
