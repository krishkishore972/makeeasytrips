import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  MapPin,
  Palmtree,
  Search,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CityOption } from "@/components/flights/flight-search-form";
import { addDaysISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

const searchTabs: { label: string; href: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Hotels", href: "/hotels", icon: BedDouble, active: true },
  { label: "Holidays", href: "/holidays", icon: Palmtree },
  { label: "Rent a car", href: "/rent-a-car", icon: CarFront },
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

type HeroSearchProps = {
  cities: CityOption[];
};

export function HeroSearch({ cities }: HeroSearchProps) {
  const checkIn = addDaysISO(todayISO(), 14);
  const checkOut = addDaysISO(checkIn, 2);

  const trendingSearches = [
    {
      label: "Goa, late November",
      href: `/hotels?city=GOI&checkin=${checkIn}&checkout=${checkOut}&rooms=1&guests=2`,
    },
    {
      label: "Udaipur courtyards",
      href: `/hotels?city=UDR&checkin=${checkIn}&checkout=${checkOut}&rooms=1&guests=2`,
    },
    {
      label: "Kochi by the water",
      href: `/hotels?city=COK&checkin=${checkIn}&checkout=${checkOut}&rooms=1&guests=2`,
    },
  ];

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

      <form action="/hotels" method="get" role="search" aria-label="Hotel search" className="mt-4">
        <div className="grid gap-2.5 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr_0.9fr_auto]">
          <Field id="city" label="Where to?" icon={MapPin}>
            <select id="city" name="city" defaultValue="GOI" className={inputClassName}>
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </Field>

          <Field id="checkin" label="Check-in" icon={CalendarDays}>
            <input
              id="checkin"
              name="checkin"
              type="date"
              defaultValue={checkIn}
              className={cn(inputClassName, "[color-scheme:light]")}
            />
          </Field>

          <Field id="checkout" label="Check-out" icon={CalendarDays}>
            <input
              id="checkout"
              name="checkout"
              type="date"
              defaultValue={checkOut}
              className={cn(inputClassName, "[color-scheme:light]")}
            />
          </Field>

          <Field id="rooms" label="Rooms" icon={BedDouble}>
            <select id="rooms" name="rooms" defaultValue="1" className={inputClassName}>
              <option value="1">1 room</option>
              <option value="2">2 rooms</option>
              <option value="3">3 rooms</option>
              <option value="4">4 rooms</option>
            </select>
          </Field>

          <Field id="guests" label="Guests" icon={UsersRound}>
            <select id="guests" name="guests" defaultValue="2" className={inputClassName}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </Field>

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
        <Link
          href="/rent-a-car"
          className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-800 transition-colors hover:bg-brand-100"
        >
          <CarFront aria-hidden="true" className="size-3.5" />
          Need a self-drive car?
        </Link>
      </div>
    </div>
  );
}
