import Link from "next/link";
import { ArrowRight, BedDouble, CarFront, Compass, Palmtree } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

type BookingEmptyStateProps = {
  title?: string;
  description: string;
  actions?: React.ReactNode;
};

const browseActions = (
  <>
    <Link
      href="/hotels"
      className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
    >
      <BedDouble aria-hidden="true" className="size-4" />
      Browse stays
    </Link>
    <Link
      href="/holidays"
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
    >
      <Palmtree aria-hidden="true" className="size-4" />
      Browse holidays
    </Link>
    <Link
      href="/rent-a-car"
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
    >
      <CarFront aria-hidden="true" className="size-4" />
      Rent a car
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </Link>
  </>
);

export function BookingEmptyState({
  title = "This booking link needs a fresh start.",
  description,
  actions = browseActions,
}: BookingEmptyStateProps) {
  return (
    <EmptyState
      icon={<Compass aria-hidden="true" className="size-6" />}
      title={title}
      description={description}
      actions={actions}
    />
  );
}
