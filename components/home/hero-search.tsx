import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  MapPin,
  Palmtree,
  Plane,
  PlaneTakeoff,
  Search,
  ShieldCheck,
  TrainFront,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const searchTabs: { label: string; href: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Flights", href: "/flights", icon: Plane, active: true },
  { label: "Hotels", href: "/hotels", icon: BedDouble },
  { label: "Holidays", href: "/holidays", icon: Palmtree },
  { label: "Trains", href: "/trains", icon: TrainFront },
  { label: "Cabs", href: "/cabs", icon: CarFront },
];

const trendingSearches = [
  {
    label: "Mumbai → Goa",
    href: "/flights?from=BOM&to=GOI&depart=2026-11-13&return=2026-11-17&pax=2&cabin=economy",
  },
  {
    label: "Delhi → Udaipur",
    href: "/flights?from=DEL&to=UDR&depart=2026-12-04&return=2026-12-08&pax=2&cabin=economy",
  },
  {
    label: "Bengaluru → Kochi",
    href: "/flights?from=BLR&to=COK&depart=2026-11-20&return=2026-11-24&pax=2&cabin=economy",
  },
];

type FieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

function Field({ id, label, icon: Icon, children, className }: FieldProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-canvas px-3 py-2 transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100",
        className,
      )}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
      >
        <Icon aria-hidden="true" className="size-3" />
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "h-7 w-full min-w-0 bg-transparent text-[13px] font-bold text-ink outline-none placeholder:text-muted-soft";

export function HeroSearch() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-lg sm:p-4 lg:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <nav
          aria-label="Search type"
          className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1"
        >
          {searchTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                  tab.active
                    ? "bg-brand-50 text-brand-800"
                    : "text-muted hover:bg-brand-50/70 hover:text-brand-800",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn("size-4", tab.active ? "text-brand-600" : "text-muted-soft")}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-muted sm:inline-flex">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-brand-500" />
          Demo search · no payment
        </span>
      </div>

      <form
        action="/flights"
        method="get"
        role="search"
        aria-label="Flight search"
        className="mt-4"
      >
        <div className="grid gap-2.5 lg:grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr_0.95fr_auto]">
          <Field id="from" label="From" icon={PlaneTakeoff}>
            <input
              id="from"
              name="from"
              type="text"
              defaultValue="Mumbai (BOM)"
              autoComplete="off"
              className={inputClassName}
            />
          </Field>

          <Field id="to" label="To" icon={MapPin}>
            <input
              id="to"
              name="to"
              type="text"
              defaultValue="Goa (GOI)"
              autoComplete="off"
              className={inputClassName}
            />
          </Field>

          <Field id="depart" label="Depart" icon={CalendarDays}>
            <input
              id="depart"
              name="depart"
              type="date"
              defaultValue="2026-11-13"
              className={cn(inputClassName, "[color-scheme:light]")}
            />
          </Field>

          <Field id="return" label="Return" icon={CalendarDays}>
            <input
              id="return"
              name="return"
              type="date"
              defaultValue="2026-11-17"
              className={cn(inputClassName, "[color-scheme:light]")}
            />
          </Field>

          <Field id="pax" label="Travellers" icon={UsersRound}>
            <select id="pax" name="pax" defaultValue="2" className={inputClassName}>
              <option value="1">1 adult</option>
              <option value="2">2 adults</option>
              <option value="3">3 adults</option>
              <option value="4">4 adults</option>
            </select>
          </Field>

          <input type="hidden" name="cabin" value="economy" />

          <button
            type="submit"
            className="inline-flex h-full min-h-14 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
          >
            <Search aria-hidden="true" className="size-4" />
            Search
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-extrabold tracking-[0.14em] text-muted-soft uppercase">
          Trending
        </span>
        {trendingSearches.map((search) => (
          <Link
            key={search.href}
            href={search.href}
            className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            {search.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
