"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";

type BookingNoticeDialogProps = {
  trigger: React.ReactElement;
  title: string;
  summary?: React.ReactNode;
};

/**
 * Honest end-point for the Phase 2 detail shells. It shows what was selected
 * without pretending a payment, account, or inventory hold exists yet.
 */
export function BookingNoticeDialog({ trigger, title, summary }: BookingNoticeDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-[80] bg-brand-950/55 backdrop-blur-[3px]" />
        <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          <div className="relative overflow-hidden bg-brand-950 px-6 pt-6 pb-5 text-white">
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-10 size-44 rounded-full bg-accent-500/30 blur-3xl"
            />
            <div className="relative flex items-center justify-between gap-4">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.14em] text-brand-200 uppercase">
                <Sparkles aria-hidden="true" className="size-3.5 text-gold-500" />
                Mock booking
              </p>
              <Dialog.Close
                aria-label="Close booking notice"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X aria-hidden="true" className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="relative mt-4 text-2xl text-white">
              Booking opens in Phase 5.
            </Dialog.Title>
            <Dialog.Description className="relative mt-2 text-sm leading-6 text-white/70">
              {title}
            </Dialog.Description>
          </div>

          <div className="p-6">
            {summary ? (
              <div className="rounded-xl border border-line bg-canvas p-4 text-sm text-ink-soft">
                {summary}
              </div>
            ) : null}

            <ul className="mt-4 space-y-2 text-xs leading-5 text-muted">
              <li className="flex items-start gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
                No payment is taken and no card details are collected.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
                No account is created, and no seat or room is held.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
                The review and confirmation screens arrive in a later phase.
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Dialog.Close className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-brand-800">
                Keep browsing
              </Dialog.Close>
              <Link
                href="/info/how-it-works"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
              >
                How TripNest is built
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
