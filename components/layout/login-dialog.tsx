"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { useId, useState } from "react";
import { Logo } from "@/components/shared/logo";

type LoginDialogProps = {
  trigger: React.ReactElement;
};

/**
 * Static, deliberately non-functional sign-in demo. It shows the UX pattern
 * (phone-first, OTP-style next step) without collecting or persisting anything.
 */
export function LoginDialog({ trigger }: LoginDialogProps) {
  const [submitted, setSubmitted] = useState(false);
  const inputId = useId();

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) setSubmitted(false);
      }}
    >
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
              <Logo tone="light" />
              <Dialog.Close
                aria-label="Close sign in"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X aria-hidden="true" className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="relative mt-6 text-2xl text-white">
              Welcome back, traveller.
            </Dialog.Title>
            <Dialog.Description className="relative mt-2 text-sm leading-6 text-white/70">
              Sign in to keep your searches, wishlists, and trip ideas in one place.
            </Dialog.Description>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-800">
                  <Sparkles aria-hidden="true" className="size-4" />
                  This is a demo
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Authentication is intentionally disabled in TripNest. No account was created and
                  no details were sent anywhere.
                </p>
                <Dialog.Close className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 underline-offset-4 hover:underline">
                  Back to exploring
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Dialog.Close>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-xs font-bold tracking-wide text-ink"
                  >
                    Mobile number or email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
                    <Phone aria-hidden="true" className="size-4 text-muted-soft" />
                    <input
                      id={inputId}
                      name="identifier"
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800"
                >
                  Continue securely
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>

                <p className="flex items-start gap-2 text-[11px] leading-5 text-muted-soft">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-brand-500"
                  />
                  Demo only. This form does not submit, store, or transmit your details.
                </p>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
