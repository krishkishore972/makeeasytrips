"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The same filter panel renders twice on small screens (desktop aside plus the
 * mobile drawer), so ids are scoped per instance to keep labels unambiguous.
 */
function useScopedId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export type FilterOption = {
  value: string;
  label: string;
  detail?: string;
  count?: number;
};

type FilterGroupProps = {
  legend: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  idPrefix: string;
  className?: string;
  /** Single-choice groups render radios instead of checkboxes. */
  multiple?: boolean;
};

export function FilterGroup({
  legend,
  options,
  selected,
  onToggle,
  idPrefix,
  className,
  multiple = true,
}: FilterGroupProps) {
  const scope = useScopedId();

  return (
    <fieldset className={cn("border-t border-line pt-4 first:border-0 first:pt-0", className)}>
      <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
        {legend}
      </legend>
      <div className="mt-2.5 space-y-0.5">
        {options.map((option) => {
          const inputId = `${idPrefix}-${scope}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-brand-50/70"
            >
              <input
                id={inputId}
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : `${idPrefix}-${scope}`}
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
                className="peer sr-only"
              />
              <span className="grid size-4 shrink-0 place-items-center rounded border border-line-strong bg-surface text-transparent transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 peer-focus-visible:ring-offset-2">
                <Check aria-hidden="true" className="size-3" />
              </span>
              <span className="min-w-0 flex-1 text-xs leading-5 font-semibold text-ink-soft">
                {option.label}
                {option.detail ? (
                  <span className="block text-[10px] leading-4 font-normal text-muted-soft">
                    {option.detail}
                  </span>
                ) : null}
              </span>
              {option.count !== undefined ? (
                <span className="text-[10px] font-bold text-muted-soft tabular-nums">
                  {option.count}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type FilterFlagProps = {
  id: string;
  label: string;
  detail?: string;
  checked: boolean;
  onChange: () => void;
};

export function FilterFlag({ id, label, detail, checked, onChange }: FilterFlagProps) {
  const scope = useScopedId();
  const inputId = `${id}-${scope}`;

  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-brand-50/70"
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded border border-line-strong bg-surface text-transparent transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300 peer-focus-visible:ring-offset-2">
        <Check aria-hidden="true" className="size-3" />
      </span>
      <span className="text-xs leading-5 font-semibold text-ink-soft">
        {label}
        {detail ? (
          <span className="block text-[10px] leading-4 font-normal text-muted-soft">{detail}</span>
        ) : null}
      </span>
    </label>
  );
}
