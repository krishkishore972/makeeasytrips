import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, ShieldCheck } from "lucide-react";
import { BookingEmptyState } from "@/components/booking/booking-empty-state";
import { BookingProgress } from "@/components/booking/booking-progress";
import { BookingPageSkeleton } from "@/components/booking/booking-skeletons";
import { BookingPricePanel, BookingSummaryCard } from "@/components/booking/booking-summary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { bookingReviewHref, resolveBooking } from "@/lib/booking";
import type { BookingType } from "@/lib/validation/booking";
import { parseBookingParams } from "@/lib/validation/booking";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demo booking confirmed",
  description:
    "A demo confirmation generated from the selected trip. No payment was taken and nothing was stored.",
  robots: {
    index: false,
    follow: false,
  },
};

type ConfirmationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ConfirmationShellProps = {
  breadcrumbs: { label: string; href?: string }[];
  action?: ReactNode;
  children: ReactNode;
};

function productCrumb(type: BookingType) {
  switch (type) {
    case "flight":
      return { label: "Flights", href: "/flights" };
    case "hotel":
      return { label: "Stays", href: "/hotels" };
    case "holiday":
      return { label: "Holidays", href: "/holidays" };
  }
}

function ConfirmationShell({ breadcrumbs, action, children }: ConfirmationShellProps) {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-4">
            <BookingProgress current="confirmation" />
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Step 3 of 3</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
                Your demo trip is confirmed.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                This page is generated from the link you just confirmed. Nothing was charged, held,
                or stored.
              </p>
            </div>
            {action}
          </div>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">{children}</div>
    </>
  );
}

export default function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <BookingConfirmationContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingConfirmationContent({ searchParams }: ConfirmationPageProps) {
  await connection();
  const raw = await searchParams;
  const parsed = parseBookingParams(raw);

  if (!parsed.selection) {
    return (
      <ConfirmationShell breadcrumbs={[{ label: "Booking" }, { label: "Confirmation" }]}>
        <BookingEmptyState
          title="There is no confirmed trip to show."
          description={
            parsed.error ??
            "That confirmation link is incomplete. Open the trip you were viewing and review it again."
          }
        />
      </ConfirmationShell>
    );
  }

  const reviewHref = bookingReviewHref(parsed.selection);
  const confirmed = firstParam(raw.confirmed) === "1";

  if (!confirmed) {
    return (
      <ConfirmationShell
        breadcrumbs={[productCrumb(parsed.selection.type), { label: "Confirmation" }]}
      >
        <BookingEmptyState
          title="Confirm your demo booking first."
          description="This confirmation link has the trip details, but the review step was not completed. Open the review page and tick the demo acknowledgement."
          actions={
            <>
              <Link
                href={reviewHref}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Review this selection
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                Back to home
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </>
          }
        />
      </ConfirmationShell>
    );
  }

  const { summary, error } = await resolveBooking(parsed.selection);

  if (!summary) {
    return (
      <ConfirmationShell
        breadcrumbs={[productCrumb(parsed.selection.type), { label: "Confirmation" }]}
      >
        <BookingEmptyState
          title="This confirmation could not be rebuilt."
          description={
            error ??
            "That selection is no longer available. Open the trip you were viewing and choose it again."
          }
          actions={
            <>
              <Link
                href={reviewHref}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to review
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                Back to home
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </>
          }
        />
      </ConfirmationShell>
    );
  }

  return (
    <ConfirmationShell
      breadcrumbs={[productCrumb(summary.type), { label: "Confirmation" }]}
      action={
        <Link
          href={summary.productHref}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
        >
          View original details
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
    >
      <div className="mb-5 flex flex-wrap items-start gap-3 rounded-2xl border border-success/20 bg-success-soft p-4 sm:p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success text-white shadow-sm">
          <Check aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold tracking-[0.12em] text-success uppercase">
            Demo reference
          </p>
          <p className="mt-1 font-mono text-xl font-extrabold tracking-[0.08em] text-ink">
            {summary.reference}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Generated from this selection. It is not a real airline, hotel, or tour operator record.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-extrabold text-success ring-1 ring-success/20">
          <ShieldCheck aria-hidden="true" className="size-3" />
          No payment taken
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-4">
          <BookingSummaryCard summary={summary} />

          <section
            aria-labelledby="next-steps-heading"
            className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <p className="eyebrow">What happens next</p>
            <h2 id="next-steps-heading" className="mt-2 text-2xl leading-tight">
              A short checklist for the demo.
            </h2>
            <ol className="mt-4 space-y-3">
              {summary.nextSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl border border-line bg-canvas p-3.5"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-700 text-[11px] font-extrabold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">{step.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28" aria-label="Confirmed trip summary">
          <BookingPricePanel summary={summary} />

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <p className="eyebrow">Keep exploring</p>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              The confirmation is a URL, not a saved account record. Bookmark it if you want to
              revisit this exact demo selection.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
              >
                Back to home
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
              <Link
                href={summary.productHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                {summary.productLabel}
              </Link>
              <Link
                href={
                  summary.type === "flight"
                    ? "/flights"
                    : summary.type === "hotel"
                      ? "/hotels"
                      : "/holidays"
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                <Compass aria-hidden="true" className="size-3.5" />
                Explore more
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </ConfirmationShell>
  );
}
