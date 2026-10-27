"use client";

import { ArrowRight, CalendarRange, Compass, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { SearchField, searchInputClassName } from "@/components/search/search-field";
import { HOLIDAY_DURATION_OPTIONS } from "@/lib/search-options";
import { cn } from "@/lib/utils";

export type HolidayDestinationOption = {
  code: string;
  name: string;
};

type HolidaySearchFormProps = {
  destinations: HolidayDestinationOption[];
  initial: {
    destination: string;
    duration: string;
    travellers: number;
  };
  className?: string;
};

export function HolidaySearchForm({ destinations, initial, className }: HolidaySearchFormProps) {
  const [destination, setDestination] = useState(initial.destination);
  const [duration, setDuration] = useState(initial.duration);
  const [travellers, setTravellers] = useState(String(initial.travellers));

  return (
    <form
      action="/holidays"
      method="get"
      role="search"
      aria-label="Holiday search"
      className={cn("rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4", className)}
    >
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_0.9fr_auto]">
        <SearchField id="holiday-destination" label="Where to" icon={Compass}>
          <select
            id="holiday-destination"
            name="destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className={searchInputClassName}
          >
            <option value="">Anywhere in India</option>
            {destinations.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="holiday-duration" label="Trip length" icon={CalendarRange}>
          <select
            id="holiday-duration"
            name="duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className={searchInputClassName}
          >
            <option value="">Any length</option>
            {HOLIDAY_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="holiday-travellers" label="Travellers" icon={UsersRound}>
          <select
            id="holiday-travellers"
            name="travellers"
            value={travellers}
            onChange={(event) => setTravellers(event.target.value)}
            className={searchInputClassName}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "traveller" : "travellers"}
              </option>
            ))}
          </select>
        </SearchField>

        <button
          type="submit"
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <p className="mt-2.5 px-1 text-[10px] leading-4 text-muted-soft">
        Leave the destination open to browse every package. Theme and budget filters sit beside the
        results.
      </p>
    </form>
  );
}
