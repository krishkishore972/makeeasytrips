"use client";

import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { newsletterSubmissionSchema } from "@/lib/validation/forms";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputId = useId();
  const errorId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const parsed = newsletterSubmissionSchema.safeParse({ email });

    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "We couldn't save your email. Please try again.");
        return;
      }

      setSubscribed(true);
    } catch {
      setError("We couldn't save your email. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

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
            We saved your email for the TripNest letter. No email has been sent yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <label htmlFor={inputId} className="sr-only">
        Email address for travel inspiration
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-canvas p-1.5 focus-within:ring-4 focus-within:ring-brand-100 ${
          error
            ? "border-danger focus-within:border-danger"
            : "border-line focus-within:border-brand-400"
        }`}
      >
        <Mail aria-hidden="true" className="ml-2 size-4 shrink-0 text-muted-soft" />
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder="you@example.com"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
        />
        <button
          type="submit"
          disabled={saving}
          aria-label="Subscribe to the TripNest letter"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] font-bold text-danger">
          {error}
        </p>
      ) : null}
      <p className="text-[11px] leading-5 text-muted-soft">
        One thoughtful travel letter a month. We save your email only for the letter and never share
        it.
      </p>
    </form>
  );
}
