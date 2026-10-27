"use client";

import { RotateCcw } from "lucide-react";
import { FilterFlag, FilterGroup } from "@/components/search/filter-group";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";
import type { HotelFacets, HotelQuery } from "@/lib/data/hotels";
import {
  AMENITY_FILTER_OPTIONS,
  GUEST_RATING_OPTIONS,
  PRICE_BAND_OPTIONS,
  type AmenityFilter,
  type PriceBand,
} from "@/lib/search-options";
import { cn } from "@/lib/utils";

type HotelFiltersProps = {
  facets: HotelFacets;
  query: HotelQuery;
  className?: string;
};

export function HotelFilters({ facets, query, className }: HotelFiltersProps) {
  const { toggleListParam, setParam, toggleFlag, clearParams, isPending } =
    useSearchParamsUpdater();

  const priceLabels = new Map(PRICE_BAND_OPTIONS.map((option) => [option.value, option.label]));
  const amenityLabels = new Map(
    AMENITY_FILTER_OPTIONS.map((option) => [option.value, option.label]),
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
          onClick={() =>
            clearParams(["price", "stars", "rating", "amenities", "breakfast", "cancel"])
          }
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline"
        >
          <RotateCcw aria-hidden="true" className="size-3" />
          Reset
        </button>
      </div>

      <FilterGroup
        legend="Price per night"
        idPrefix="hotel-price"
        options={facets.priceBands
          .slice()
          .sort(
            (a, b) =>
              PRICE_BAND_OPTIONS.findIndex((option) => option.value === a.value) -
              PRICE_BAND_OPTIONS.findIndex((option) => option.value === b.value),
          )
          .map((facet) => ({
            value: facet.value,
            label: priceLabels.get(facet.value as PriceBand) ?? facet.label,
            count: facet.count,
          }))}
        selected={query.priceBands}
        onToggle={(value) => toggleListParam("price", value)}
      />

      <FilterGroup
        legend="Star rating"
        idPrefix="hotel-stars"
        options={facets.stars.map((facet) => ({
          value: facet.value,
          label: `${facet.value}-star`,
          count: facet.count,
        }))}
        selected={query.stars.map(String)}
        onToggle={(value) => toggleListParam("stars", value)}
      />

      <FilterGroup
        legend="Guest rating"
        idPrefix="hotel-rating"
        multiple={false}
        options={GUEST_RATING_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        selected={query.minRating ? [String(query.minRating)] : []}
        onToggle={(value) => setParam("rating", query.minRating === Number(value) ? null : value)}
      />

      <FilterGroup
        legend="Amenities"
        idPrefix="hotel-amenities"
        options={facets.amenities
          .filter((facet) => amenityLabels.has(facet.value as AmenityFilter))
          .map((facet) => ({
            value: facet.value,
            label: amenityLabels.get(facet.value as AmenityFilter) ?? facet.label,
            count: facet.count,
          }))}
        selected={query.amenities}
        onToggle={(value) => toggleListParam("amenities", value)}
      />

      <fieldset className="border-t border-line pt-4">
        <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
          Stay preferences
        </legend>
        <div className="mt-2.5 space-y-1">
          <FilterFlag
            id="hotel-breakfast"
            label="Breakfast included"
            detail={`${facets.breakfast} stays`}
            checked={query.breakfastOnly}
            onChange={() => toggleFlag("breakfast")}
          />
          <FilterFlag
            id="hotel-cancel"
            label="Free cancellation"
            detail={`${facets.cancellation} stays`}
            checked={query.cancellationOnly}
            onChange={() => toggleFlag("cancel")}
          />
        </div>
      </fieldset>
    </div>
  );
}
