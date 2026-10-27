"use client";

import { ArrowDownWideNarrow } from "lucide-react";
import { useSearchParamsUpdater } from "@/components/search/use-search-params-updater";

type SortSelectProps = {
  value: string;
  options: { value: string; label: string }[];
  label?: string;
};

export function SortSelect({ value, options, label = "Sort results" }: SortSelectProps) {
  const { setParam, isPending } = useSearchParamsUpdater();

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-soft shadow-xs">
      <ArrowDownWideNarrow aria-hidden="true" className="size-4 text-brand-600" />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => setParam("sort", event.target.value)}
        disabled={isPending}
        className="max-w-[11rem] cursor-pointer bg-transparent pr-1 text-xs font-bold text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
