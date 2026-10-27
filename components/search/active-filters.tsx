"use client";

import { X } from "lucide-react";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";

export type ActiveFilterChip = {
  key: string;
  value?: string;
  label: string;
  mode?: "list" | "value";
};

type ActiveFiltersProps = {
  filters: ActiveFilterChip[];
  clearKeys: string[];
};

export function ActiveFilters({ filters, clearKeys }: ActiveFiltersProps) {
  const { toggleListParam, setParam, clearParams } = useSearchParamsUpdater();

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
        Active
      </span>
      {filters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value ?? "all"}`}
          type="button"
          onClick={() => {
            if (filter.mode === "value" || !filter.value) {
              setParam(filter.key, null);
            } else {
              toggleListParam(filter.key, filter.value);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-100"
        >
          {filter.label}
          <X aria-hidden="true" className="size-3" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => clearParams(clearKeys)}
        className="text-[11px] font-extrabold text-muted underline-offset-4 hover:text-brand-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
