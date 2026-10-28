"use client";

import { RotateCcw } from "lucide-react";
import { FilterFlag, FilterGroup } from "@/components/search/filter-group";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";
import type { CarFacets, CarQuery } from "@/lib/data/cars";
import {
  CAR_BUDGET_OPTIONS,
  CAR_RATING_OPTIONS,
  CAR_SEAT_BAND_OPTIONS,
  CAR_TYPE_OPTIONS,
  type CarSeatBand,
  type CarType,
} from "@/lib/search-options";
import { cn } from "@/lib/utils";

type CarFiltersProps = {
  facets: CarFacets;
  query: CarQuery;
  className?: string;
};

export function CarFilters({ facets, query, className }: CarFiltersProps) {
  const { toggleListParam, setParam, toggleFlag, clearParams, isPending } =
    useSearchParamsUpdater();

  const typeLabels = new Map(CAR_TYPE_OPTIONS.map((option) => [option.value, option.label]));
  const seatLabels = new Map(CAR_SEAT_BAND_OPTIONS.map((option) => [option.value, option.label]));

  return (
    <div
      aria-busy={isPending}
      className={cn("space-y-5 transition-opacity", isPending && "opacity-60", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">Filters</p>
        <button
          type="button"
          onClick={() =>
            clearParams([
              "budget",
              "type",
              "transmission",
              "fuel",
              "seats",
              "rating",
              "year",
              "distance",
              "fastag",
              "delivery",
            ])
          }
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          Reset
        </button>
      </div>

      <FilterGroup
        legend="Budget per hour"
        idPrefix="car-budget"
        options={CAR_BUDGET_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          detail: option.detail,
        }))}
        selected={query.budgets}
        onToggle={(value) => toggleListParam("budget", value)}
      />

      <FilterGroup
        legend="Car type"
        idPrefix="car-type"
        options={facets.types.map((facet) => ({
          value: facet.value,
          label: typeLabels.get(facet.value as CarType) ?? facet.label,
          count: facet.count,
        }))}
        selected={query.types}
        onToggle={(value) => toggleListParam("type", value)}
      />

      <FilterGroup
        legend="Transmission"
        idPrefix="car-transmission"
        options={facets.transmissions.map((facet) => ({
          value: facet.value,
          label: facet.value,
          count: facet.count,
        }))}
        selected={query.transmissions}
        onToggle={(value) => toggleListParam("transmission", value)}
      />

      <FilterGroup
        legend="Fuel"
        idPrefix="car-fuel"
        options={facets.fuels.map((facet) => ({
          value: facet.value,
          label: facet.value,
          count: facet.count,
        }))}
        selected={query.fuels}
        onToggle={(value) => toggleListParam("fuel", value)}
      />

      <FilterGroup
        legend="Seats"
        idPrefix="car-seats"
        options={facets.seats.map((facet) => ({
          value: facet.value,
          label: seatLabels.get(facet.value as CarSeatBand) ?? facet.label,
          count: facet.count,
        }))}
        selected={query.seatBands}
        onToggle={(value) => toggleListParam("seats", value)}
      />

      <FilterGroup
        legend="Guest rating"
        idPrefix="car-rating"
        multiple={false}
        options={CAR_RATING_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          count: facets.ratings.find((facet) => facet.value === option.value)?.count,
        }))}
        selected={query.minRating ? [String(query.minRating)] : []}
        onToggle={(value) => setParam("rating", query.minRating === Number(value) ? null : value)}
      />

      <FilterGroup
        legend="Model year"
        idPrefix="car-year"
        multiple={false}
        options={Array.from(
          { length: Math.max(1, facets.maxYear - Math.max(2023, facets.minYear) + 1) },
          (_, index) => Math.max(2023, facets.minYear) + index,
        )
          .sort((a, b) => b - a)
          .map((year) => ({
            value: String(year),
            label: `${year} or newer`,
          }))}
        selected={query.minYear ? [String(query.minYear)] : []}
        onToggle={(value) => setParam("year", query.minYear === Number(value) ? null : value)}
      />

      <FilterGroup
        legend="Distance from you"
        idPrefix="car-distance"
        multiple={false}
        options={[5, 10, 20, 30].map((distance) => ({
          value: String(distance),
          label: `Within ${distance} km`,
        }))}
        selected={query.maxDistance ? [String(query.maxDistance)] : []}
        onToggle={(value) =>
          setParam("distance", query.maxDistance === Number(value) ? null : value)
        }
      />

      <fieldset className="border-t border-line pt-4">
        <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
          Car preferences
        </legend>
        <div className="mt-2.5 space-y-1">
          <FilterFlag
            id="car-fastag"
            label="Active FASTag"
            detail={`${facets.fastag} cars · tolls billed separately`}
            checked={query.fastagOnly}
            onChange={() => toggleFlag("fastag")}
          />
          <FilterFlag
            id="car-delivery"
            label="Home delivery"
            detail={`${facets.delivery} cars · extra fee may apply`}
            checked={query.deliveryOnly}
            onChange={() => toggleFlag("delivery")}
          />
        </div>
      </fieldset>

      <p className="rounded-lg bg-canvas px-3 py-2 text-[10px] leading-4 text-muted-soft">
        Transmission, fuel, and seat counts come from the demo catalogue. Filters combine with AND,
        except within a group.
      </p>
    </div>
  );
}
