"use client";

import { RotateCcw } from "lucide-react";
import { FilterGroup } from "@/components/search/filter-group";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";
import type { HolidayFacets, HolidayQuery } from "@/lib/data/holidays";
import {
  HOLIDAY_DURATION_OPTIONS,
  HOLIDAY_PRICE_BAND_OPTIONS,
  HOLIDAY_THEME_LABELS,
  type HolidayDuration,
  type HolidayPriceBand,
  type HolidayTheme,
} from "@/lib/search-options";
import { cn } from "@/lib/utils";

type HolidayFiltersProps = {
  facets: HolidayFacets;
  query: HolidayQuery;
  destinationNames: Record<string, string>;
  className?: string;
};

export function HolidayFilters({
  facets,
  query,
  destinationNames,
  className,
}: HolidayFiltersProps) {
  const { toggleListParam, setParam, clearParams, isPending } = useSearchParamsUpdater();

  const durationLabels = new Map(
    HOLIDAY_DURATION_OPTIONS.map((option) => [option.value, option.label]),
  );
  const priceLabels = new Map(
    HOLIDAY_PRICE_BAND_OPTIONS.map((option) => [option.value, option.label]),
  );

  return (
    <div
      aria-busy={isPending}
      className={cn("space-y-5 transition-opacity", isPending && "opacity-60", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">Filters</p>
        <button
          type="button"
          onClick={() => clearParams(["destination", "theme", "duration", "price"])}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          Reset
        </button>
      </div>

      <FilterGroup
        legend="Destination"
        idPrefix="holiday-destination"
        multiple={false}
        options={facets.destinations.map((facet) => ({
          value: facet.value,
          label: destinationNames[facet.value] ?? facet.value,
          count: facet.count,
        }))}
        selected={query.destination ? [query.destination] : []}
        onToggle={(value) => setParam("destination", value)}
      />

      <FilterGroup
        legend="Theme"
        idPrefix="holiday-theme"
        options={facets.themes.map((facet) => ({
          value: facet.value,
          label: HOLIDAY_THEME_LABELS[facet.value as HolidayTheme] ?? facet.label,
          count: facet.count,
        }))}
        selected={query.themes}
        onToggle={(value) => toggleListParam("theme", value)}
      />

      <FilterGroup
        legend="Trip length"
        idPrefix="holiday-duration"
        options={facets.durations.map((facet) => ({
          value: facet.value,
          label: durationLabels.get(facet.value as HolidayDuration) ?? facet.label,
          count: facet.count,
        }))}
        selected={query.durations}
        onToggle={(value) => toggleListParam("duration", value)}
      />

      <FilterGroup
        legend="Price per person"
        idPrefix="holiday-price"
        options={facets.priceBands.map((facet) => ({
          value: facet.value,
          label: priceLabels.get(facet.value as HolidayPriceBand) ?? facet.label,
          count: facet.count,
        }))}
        selected={query.priceBands}
        onToggle={(value) => toggleListParam("price", value)}
      />
    </div>
  );
}
