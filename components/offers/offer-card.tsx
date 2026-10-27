import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { CopyCodeButton } from "@/components/offers/copy-code-button";
import { OfferIcon } from "@/components/offers/offer-icon";
import { formatDateLong } from "@/lib/dates";
import type { Offer } from "@/lib/data/schemas";
import type { OfferTone } from "@/lib/search-options";
import { cn } from "@/lib/utils";

const tones: Record<
  OfferTone,
  { card: string; icon: string; badge: string; code: string; link: string }
> = {
  coral: {
    card: "border-accent-100 bg-accent-50",
    icon: "bg-accent-500 text-white",
    badge: "bg-surface/80 text-accent-700",
    code: "border-accent-200 text-accent-700",
    link: "text-accent-700",
  },
  teal: {
    card: "border-brand-100 bg-brand-50",
    icon: "bg-brand-700 text-white",
    badge: "bg-surface/80 text-brand-800",
    code: "border-brand-200 text-brand-800",
    link: "text-brand-700",
  },
  gold: {
    card: "border-gold-100 bg-[#fffaf0]",
    icon: "bg-gold-500 text-brand-950",
    badge: "bg-surface/80 text-gold-600",
    code: "border-gold-500/40 text-gold-600",
    link: "text-gold-600",
  },
};

type OfferCardProps = {
  offer: Offer;
  className?: string;
};

export function OfferCard({ offer, className }: OfferCardProps) {
  const tone = tones[offer.tone];

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border p-5 transition-shadow hover:shadow-md",
        tone.card,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn("grid size-11 shrink-0 place-items-center rounded-xl shadow-xs", tone.icon)}
        >
          <OfferIcon name={offer.icon} className="size-5" />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {offer.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-950 px-2 py-1 text-[10px] font-extrabold text-white">
              <Sparkles aria-hidden="true" className="size-3 text-gold-500" />
              Featured
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-extrabold shadow-xs",
              tone.badge,
            )}
          >
            {offer.discount_label}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[10px] font-extrabold tracking-[0.14em] text-muted-soft uppercase">
        {offer.eyebrow}
      </p>
      <h3 className="mt-1 text-xl leading-tight">{offer.title}</h3>
      <p className="mt-2 text-xs leading-6 text-muted">{offer.description}</p>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CopyCodeButton code={offer.code} className={tone.code} />
          <span className="text-[10px] font-semibold text-muted-soft">
            Valid until {formatDateLong(offer.valid_until)}
          </span>
        </div>

        <details className="mt-2">
          <summary className="w-fit cursor-pointer text-[10px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline">
            Terms
          </summary>
          <p className="mt-1 text-[10px] leading-4 text-muted-soft">{offer.terms}</p>
        </details>

        <div className="mt-3 border-t border-line/70 pt-3">
          <Link
            href={offer.cta_href}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-extrabold underline-offset-4 hover:underline",
              tone.link,
            )}
          >
            {offer.cta_label}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
