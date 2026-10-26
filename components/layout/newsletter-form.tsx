"use client";

import { ArrowRight, Check, Mail } from "lucide-react";
import { useId, useState } from "react";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const inputId = useId();

  if (subscribed) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4"
      >
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-700 text-white">
          <Check aria-hidden="true" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-800">You&apos;re on the list.</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Demo only — no email was stored or sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubscribed(true);
      }}
      className="space-y-2"
    >
      <label htmlFor={inputId} className="sr-only">
        Email address for travel inspiration
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas p-1.5 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <Mail aria-hidden="true" className="ml-2 size-4 shrink-0 text-muted-soft" />
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
        />
        <button
          type="submit"
          aria-label="Subscribe to the TripNest letter"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="text-[11px] leading-5 text-muted-soft">
        One thoughtful travel letter a month. No spam, no data collection in this demo.
      </p>
    </form>
  );
}
