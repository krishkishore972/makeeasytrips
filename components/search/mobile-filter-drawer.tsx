"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileFilterDrawerProps = {
  title: string;
  activeCount: number;
  children: React.ReactNode;
  className?: string;
};

export function MobileFilterDrawer({
  title,
  activeCount,
  children,
  className,
}: MobileFilterDrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-extrabold text-ink shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50",
            className,
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4 text-brand-600" />
          Filters
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-[10px] font-extrabold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-[80] bg-brand-950/55 backdrop-blur-[2px]" />
        <Dialog.Content
          data-lenis-prevent
          className="dialog-sheet fixed inset-y-0 right-0 z-[90] flex w-[min(90vw,23rem)] flex-col overflow-y-auto bg-surface p-5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <Dialog.Title className="text-xl">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted">
                Changes apply to the results immediately.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={`Close ${title.toLowerCase()}`}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-brand-50"
            >
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </div>

          <div className="py-5">{children}</div>

          <Dialog.Close className="sticky bottom-0 mt-auto inline-flex h-11 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white shadow-sm">
            Show results
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
