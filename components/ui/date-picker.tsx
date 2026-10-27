"use client";

import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import { formatDateLong, isValidISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  id?: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
};

function toDate(value: string) {
  if (!isValidISODate(value)) return undefined;
  return new Date(`${value}T12:00:00`);
}

function toISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  className,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          className={cn(
            "flex h-full w-full min-w-0 flex-col items-start justify-center gap-1 rounded-xl border border-line bg-canvas px-3 py-2 text-left transition-colors hover:border-brand-200 focus-visible:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
            <CalendarDays aria-hidden="true" className="size-3" />
            {label}
          </span>
          <span className="flex w-full items-center justify-between gap-2">
            <span className="truncate text-[13px] font-bold text-ink">
              {value ? formatDateLong(value) : "Choose a date"}
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 shrink-0 rotate-90 text-muted-soft"
            />
          </span>
        </button>
      </Popover.Trigger>

      <input type="hidden" name={name} value={value} />

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-[95] rounded-2xl border border-line bg-surface p-3 shadow-lg"
        >
          <DayPicker
            mode="single"
            selected={toDate(value)}
            onSelect={(date) => {
              if (!date) return;
              onChange(toISO(date));
              setOpen(false);
            }}
            disabled={[
              ...(min ? [{ before: new Date(`${min}T00:00:00`) }] : []),
              ...(max ? [{ after: new Date(`${max}T00:00:00`) }] : []),
            ]}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft aria-hidden="true" className="size-4" />
                ) : (
                  <ChevronRight aria-hidden="true" className="size-4" />
                ),
            }}
            classNames={{
              root: "rdp-tripnest",
              month_caption: "rdp-tripnest-caption",
              nav: "rdp-tripnest-nav",
            }}
          />
          <p className="mt-2 border-t border-line px-2 pt-2 text-[11px] text-muted-soft">
            Dates are demo only. No availability is held.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
