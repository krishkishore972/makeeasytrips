"use client";

import { RotateCcw } from "lucide-react";
import { FilterFlag, FilterGroup } from "@/components/search/filter-group";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";
import type { FlightFacets, FlightQuery } from "@/lib/data/flights";
import {
  DEPARTURE_WINDOW_OPTIONS,
  DURATION_BAND_OPTIONS,
  type DepartureWindow,
  type DurationBand,
} from "@/lib/search-options";
import { cn } from "@/lib/utils";

type FlightFiltersProps = {
  facets: FlightFacets;
  query: FlightQuery;
  className?: string;
};

export function FlightFilters({ facets, query, className }: FlightFiltersProps) {
  const { toggleListParam, toggleFlag, clearParams, isPending } = useSearchParamsUpdater();

  const windowLabels = new Map(
    DEPARTURE_WINDOW_OPTIONS.map((option) => [option.value, option.label]),
  );
  const durationLabels = new Map(
    DURATION_BAND_OPTIONS.map((option) => [option.value, option.label]),
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
          onClick={() => clearParams(["stops", "airlines", "window", "duration", "refundable"])}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          Reset
        </button>
      </div>

      <FilterGroup
        legend="Stops"
        idPrefix="flight-stops"
        options={facets.stops.map((facet) => ({
          value: facet.value,
          label: facet.value === "0" ? "Nonstop" : `${facet.value} stop`,
          count: facet.count,
        }))}
        selected={query.stops}
        onToggle={(value) => toggleListParam("stops", value)}
      />

      <FilterGroup
        legend="Airlines"
        idPrefix="flight-airlines"
        options={facets.airlines.map((facet) => ({
          value: facet.value,
          label: facet.label,
          count: facet.count,
        }))}
        selected={query.airlines}
        onToggle={(value) => toggleListParam("airlines", value)}
      />

      <FilterGroup
        legend="Departure time"
        idPrefix="flight-window"
        options={facets.windows.map((facet) => ({
          value: facet.value,
          label: windowLabels.get(facet.value as DepartureWindow) ?? facet.value,
          count: facet.count,
        }))}
        selected={query.windows}
        onToggle={(value) => toggleListParam("window", value)}
      />

      <FilterGroup
        legend="Journey time"
        idPrefix="flight-duration"
        options={facets.durations.map((facet) => ({
          value: facet.value,
          label: durationLabels.get(facet.value as DurationBand) ?? facet.value,
          count: facet.count,
        }))}
        selected={query.durations}
        onToggle={(value) => toggleListParam("duration", value)}
      />

      <fieldset className="border-t border-line pt-4">
        <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
          Fare
        </legend>
        <div className="mt-2.5">
          <FilterFlag
            id="flight-refundable"
            label="Refundable fares only"
            detail={`${facets.refundable} of ${facets.airlines.reduce((sum, airline) => sum + airline.count, 0)} flights`}
            checked={query.refundableOnly}
            onChange={() => toggleFlag("refundable")}
          />
        </div>
      </fieldset>
    </div>
  );
}
