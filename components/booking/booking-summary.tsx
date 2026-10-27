import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import type { BookingSummary } from "@/lib/booking";
import { formatCurrency } from "@/lib/utils";

type BookingSummaryCardProps = {
  summary: BookingSummary;
};

export function BookingSummaryCard({ summary }: BookingSummaryCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
      <div className="relative aspect-[16/7] overflow-hidden bg-brand-50 sm:aspect-[16/5]">
        <Image
          src={summary.image}
          alt={summary.imageAlt}
          fill
          sizes="(min-width: 1024px) 48rem, 100vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-white uppercase backdrop-blur">
          {summary.typeLabel}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Your selection</p>
            <h2 className="mt-2 text-2xl leading-tight sm:text-3xl">{summary.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted">{summary.subtitle}</p>
          </div>
          <Link
            href={summary.productHref}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[11px] font-extrabold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            {summary.productLabel}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          {summary.details.map((detail) => (
            <div key={detail.label} className="rounded-xl bg-canvas px-3 py-2.5">
              <dt className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                {detail.label}
              </dt>
              <dd className="mt-0.5 text-xs leading-5 font-bold text-ink">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-[10px] font-extrabold tracking-[0.1em] text-brand-800 uppercase">
            What is included
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {summary.inclusions.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-ink-soft">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-700 text-white">
                  <Check aria-hidden="true" className="size-2.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

type BookingPricePanelProps = {
  summary: BookingSummary;
};

export function BookingPricePanel({ summary }: BookingPricePanelProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="eyebrow">Price summary</p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-extrabold text-ink">{summary.totalLabel}</span>
        <span className="text-2xl font-extrabold text-ink">
          {formatCurrency(summary.breakdown.total)}
        </span>
      </div>

      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
        {summary.breakdownRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-bold text-ink">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <dt className="text-sm font-extrabold text-ink">Total</dt>
          <dd className="text-lg font-extrabold text-ink">
            {formatCurrency(summary.breakdown.total)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
        {summary.priceNote}
      </p>
    </div>
  );
}
