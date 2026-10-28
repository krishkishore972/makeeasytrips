import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { ArrowLeft, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { BookingConfirm } from "@/components/booking/booking-confirm";
import { BookingEmptyState } from "@/components/booking/booking-empty-state";
import { BookingProgress } from "@/components/booking/booking-progress";
import { BookingPageSkeleton } from "@/components/booking/booking-skeletons";
import { BookingPricePanel, BookingSummaryCard } from "@/components/booking/booking-summary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { resolveBooking } from "@/lib/booking";
import type { BookingType } from "@/lib/validation/booking";
import { parseBookingParams } from "@/lib/validation/booking";

export const metadata: Metadata = {
  title: "Review your demo booking",
  description:
    "Check the demo trip details before confirming. No payment, account, or real booking is created.",
  robots: {
    index: false,
    follow: false,
  },
};

type ReviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ReviewShellProps = {
  breadcrumbs: { label: string; href?: string }[];
  action?: ReactNode;
  children: ReactNode;
};

const assurances = [
  {
    icon: ShieldCheck,
    title: "No payment",
    detail: "No card, UPI, or bank details are requested at any point.",
  },
  {
    icon: UserRound,
    title: "No personal details",
    detail: "No name, email, or phone number is collected or stored.",
  },
  {
    icon: Clock3,
    title: "No inventory hold",
    detail: "Seats, rooms, and departures are never reserved in this demo.",
  },
] as const;

function productCrumb(type: BookingType) {
  switch (type) {
    case "flight":
      return { label: "Flights", href: "/flights" };
    case "hotel":
      return { label: "Stays", href: "/hotels" };
    case "holiday":
      return { label: "Holidays", href: "/holidays" };
    case "car":
      return { label: "Rent a car", href: "/rent-a-car" };
  }
}

function ReviewShell({ breadcrumbs, action, children }: ReviewShellProps) {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="page-container py-6 sm:py-8">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-4">
            <BookingProgress current="review" />
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Step 2 of 3</p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-[1.05]">
                Review your demo trip.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Check the dates, travellers, and total. Confirming creates a demo reference only —
                no payment, account, or inventory hold.
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

export default function BookingReviewPage({ searchParams }: ReviewPageProps) {
  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <BookingReviewContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingReviewContent({ searchParams }: ReviewPageProps) {
  await connection();
  const raw = await searchParams;
  const parsed = parseBookingParams(raw);

  if (!parsed.selection) {
    return (
      <ReviewShell breadcrumbs={[{ label: "Booking" }, { label: "Review" }]}>
        <BookingEmptyState
          description={
            parsed.error ??
            "That booking link is incomplete. Open the trip you were viewing and choose it again."
          }
        />
      </ReviewShell>
    );
  }

  const { summary, error } = await resolveBooking(parsed.selection);

  if (!summary) {
    return (
      <ReviewShell breadcrumbs={[{ label: "Booking" }, { label: "Review" }]}>
        <BookingEmptyState
          description={
            error ??
            "That selection is no longer available. Open the trip you were viewing and choose it again."
          }
        />
      </ReviewShell>
    );
  }

  return (
    <ReviewShell
      breadcrumbs={[productCrumb(summary.type), { label: "Review" }]}
      action={
        <Link
          href={summary.productHref}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Change selection
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-4">
          <BookingSummaryCard summary={summary} />

          <section
            aria-labelledby="before-confirm-heading"
            className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <p className="eyebrow">Before you confirm</p>
            <h2 id="before-confirm-heading" className="mt-2 text-2xl leading-tight">
              What this demo does — and does not do.
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {assurances.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.title} className="rounded-xl border border-line bg-canvas p-3.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <p className="mt-2.5 text-xs font-extrabold text-ink">{item.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">{item.detail}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28" aria-label="Confirm this selection">
          <BookingPricePanel summary={summary} />
          <BookingConfirm selection={parsed.selection} />

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <p className="text-xs font-extrabold tracking-[0.1em] text-brand-800 uppercase">
              Need to change something?
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              Go back to the original page to switch a fare, rate plan, date, or traveller count.
              Nothing has been saved yet.
            </p>
            <Link
              href={summary.productHref}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700 underline-offset-4 hover:underline"
            >
              {summary.productLabel}
            </Link>
          </div>
        </aside>
      </div>
    </ReviewShell>
  );
}
