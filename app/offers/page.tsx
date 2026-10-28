import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Copy,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { CopyCodeButton } from "@/components/offers/copy-code-button";
import { OfferCard } from "@/components/offers/offer-card";
import { OfferCategoryTabs } from "@/components/offers/offer-category-tabs";
import { OfferIcon } from "@/components/offers/offer-icon";
import { OffersPageSkeleton } from "@/components/offers/offer-skeletons";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateLong } from "@/lib/dates";
import { getOfferCategoryCounts, getOffersByCategory } from "@/lib/data/offers";
import { OFFER_CATEGORY_OPTIONS } from "@/lib/search-options";
import { parseOfferSearchParams } from "@/lib/validation/search";

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Demo-only travel offers across stays, holidays, and self-drive car rentals. No card is ever charged.",
  alternates: {
    canonical: "/offers",
  },
};

type OffersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function OffersPage({ searchParams }: OffersPageProps) {
  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute top-[-7rem] right-[-4rem] size-72 rounded-full bg-accent-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-8rem] left-[-5rem] size-72 rounded-full bg-brand-400/20 blur-3xl"
        />
        <div className="page-container relative py-12 sm:py-16">
          <p className="eyebrow text-brand-200">Offers</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.04] text-white">
            Good value, without the treasure hunt.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            A small, honest board of fictional travel offers. Copy a code, read the terms, and see
            exactly which demo search it belongs to. Nothing is charged.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-white/70">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-brand-200" />
              No payment
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              <Copy aria-hidden="true" className="size-3.5 text-brand-200" />
              Codes are copyable
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5 text-brand-200" />
              Validity shown
            </span>
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <Suspense fallback={<OffersPageSkeleton />}>
          <OffersExperience searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function OffersExperience({ searchParams }: OffersPageProps) {
  await connection();
  const params = await searchParams;
  const parsed = parseOfferSearchParams(params);

  const [offers, categoryCounts] = await Promise.all([
    getOffersByCategory(parsed.category),
    getOfferCategoryCounts(),
  ]);

  const categories = categoryCounts.map((entry) => ({
    ...entry,
    label:
      OFFER_CATEGORY_OPTIONS.find((option) => option.value === entry.value)?.label ?? entry.value,
  }));

  const featured = offers.find((offer) => offer.featured);
  const rest = featured ? offers.filter((offer) => offer.id !== featured.id) : offers;

  return (
    <>
      <OfferCategoryTabs categories={categories} active={parsed.category} />

      {parsed.error ? (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">That category is not available.</p>
            <p className="mt-1 text-xs leading-5">
              Showing every current offer instead. Pick a category above to narrow the board.
            </p>
          </div>
          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-xs font-extrabold underline underline-offset-4"
          >
            All offers
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {featured ? (
        <section
          aria-labelledby="featured-offer-heading"
          className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-brand-100 bg-brand-950 text-white shadow-sm"
        >
          <div
            aria-hidden="true"
            className="absolute -top-20 right-10 size-64 rounded-full bg-accent-500/25 blur-3xl"
          />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.12em] text-brand-100 uppercase">
                  {featured.eyebrow}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-extrabold text-brand-950">
                  <Sparkles aria-hidden="true" className="size-3" />
                  Featured offer
                </span>
              </div>
              <h2
                id="featured-offer-heading"
                className="mt-3 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-white"
              >
                {featured.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                {featured.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <CopyCodeButton
                  code={featured.code}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                />
                <Link
                  href={featured.cta_href}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
                >
                  {featured.cta_label}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
                <span className="text-[10px] font-semibold text-white/65">
                  Valid until {formatDateLong(featured.valid_until)}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-[10px] leading-4 text-white/65">{featured.terms}</p>
            </div>

            <div className="hidden justify-center lg:flex" aria-hidden="true">
              <div className="relative grid size-48 place-items-center rounded-full border border-white/15 bg-white/5">
                <div className="grid size-32 place-items-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 shadow-glow">
                  <OfferIcon name={featured.icon} className="size-14 text-white" />
                </div>
                <span className="absolute -bottom-2 rounded-full border border-white/15 bg-brand-950/80 px-3 py-1.5 text-[11px] font-extrabold text-white backdrop-blur">
                  {featured.discount_label}
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="all-offers-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              {parsed.category === "all" ? "The full board" : "This category"}
            </p>
            <h2 id="all-offers-heading" className="mt-2 text-2xl leading-tight sm:text-3xl">
              {parsed.category === "all" ? "Every current offer." : "Offers for this travel line."}
            </h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-extrabold text-ink">{offers.length}</span>{" "}
              {offers.length === 1 ? "offer" : "offers"}
              <span className="text-muted-soft"> · demo codes only</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-bold text-muted">
            <Tag aria-hidden="true" className="size-3.5 text-brand-600" />
            Updated for this demo
          </span>
        </div>

        {rest.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            className="mt-5"
            title="No offers in this category yet."
            description="The demo board has offers across stays, holidays, and self-drive car rentals. Try another category."
            actions={
              <Link
                href="/offers"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white"
              >
                See all offers
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            }
          />
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface p-6 text-center text-xs text-muted">
            This is the only offer in this category right now. The featured offer above has the full
            details.
          </p>
        )}
      </section>

      <section aria-labelledby="offer-notes-heading" className="mt-10">
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:p-6">
          <p className="eyebrow">How this board works</p>
          <h2 id="offer-notes-heading" className="mt-2 text-2xl leading-tight">
            Small print, before the small print.
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface p-4">
              <Copy aria-hidden="true" className="size-5 text-brand-600" />
              <h3 className="mt-2 text-sm font-extrabold text-ink">Codes are just text</h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                Copying a code puts it on your clipboard. Nothing is applied to a cart, because
                there is no cart in this learning project.
              </p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <ShieldCheck aria-hidden="true" className="size-5 text-brand-600" />
              <h3 className="mt-2 text-sm font-extrabold text-ink">No payment, ever</h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                Discounts, prices, and availability are illustrative. No card details are collected
                and no booking is created.
              </p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <CalendarDays aria-hidden="true" className="size-5 text-brand-600" />
              <h3 className="mt-2 text-sm font-extrabold text-ink">Validity is demo-only</h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                Dates are shown so the board feels complete. They do not gate any real inventory or
                unlock a real price.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
