import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type FeaturePreviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
  highlights: string[];
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

/**
 * Shared shell for routes that are intentionally deferred to a later phase.
 * It keeps the navigation honest without pretending the flow is complete.
 */
export function FeaturePreview({
  eyebrow,
  title,
  description,
  icon: Icon,
  phase,
  highlights,
  children,
  primaryAction = { label: "Explore holidays", href: "/holidays" },
  secondaryAction = { label: "View offers", href: "/offers" },
}: FeaturePreviewProps) {
  return (
    <div className="page-container py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-brand-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to home
      </Link>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
        <section className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-20 size-64 rounded-full bg-brand-100/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-20 size-56 rounded-full bg-accent-100/60 blur-3xl"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-brand-700 uppercase">
              <Icon aria-hidden="true" className="size-3.5" />
              {eyebrow}
            </span>

            <h1 className="mt-5 max-w-2xl text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.04]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>

            {children}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryAction.href}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
              >
                {primaryAction.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                {secondaryAction.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
            <p className="eyebrow">In this phase</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-extrabold text-ink">
              <Clock3 aria-hidden="true" className="size-4 text-brand-500" />
              {phase}
            </div>
            <ul className="mt-4 space-y-3">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2 text-sm leading-6 text-muted">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-brand-500"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold text-accent-700">
              <Sparkles aria-hidden="true" className="size-4" />
              Foundation preview
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              This route is a deliberate placeholder while the shared layout, tokens, and data layer
              are built. No real bookings, payments, or accounts happen here.
            </p>
            <Link
              href="/info/how-it-works"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-accent-700 underline-offset-4 hover:underline"
            >
              How TripNest is being built
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
