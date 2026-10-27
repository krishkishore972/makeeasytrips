import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "selection", label: "Your selection" },
  { id: "review", label: "Review" },
  { id: "confirmation", label: "Confirmation" },
] as const;

type BookingProgressProps = {
  current: "review" | "confirmation";
};

export function BookingProgress({ current }: BookingProgressProps) {
  const currentIndex = current === "review" ? 1 : 2;

  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Booking progress">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="h-px w-3 bg-line-strong sm:w-5" />
            ) : null}
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] uppercase",
                done
                  ? "bg-success-soft text-success"
                  : active
                    ? "bg-brand-700 text-white"
                    : "bg-canvas text-muted-soft ring-1 ring-line",
              )}
            >
              {done ? (
                <Check aria-hidden="true" className="size-3" />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-4 place-items-center rounded-full text-[9px]",
                    active ? "bg-white/15 text-white" : "bg-surface text-ink-soft",
                  )}
                >
                  {index + 1}
                </span>
              )}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
