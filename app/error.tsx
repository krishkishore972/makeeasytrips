"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

type ErrorPageProps = {
  error: unknown;
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error("TripNest route error:", error);
  }, [error]);

  return (
    <div className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center shadow-xs sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle aria-hidden="true" className="size-8" />
        </span>
        <p className="eyebrow mt-6">Something went sideways</p>
        <h1 className="mt-2 text-[clamp(1.9rem,4vw,2.6rem)]">
          This part of the trip did not load.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
          A route error was caught by the error boundary. Try rendering the section again, or head
          back to the home page and start from there.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-[11px] leading-5 text-muted-soft">
          In production, server error details are intentionally hidden. Check the server logs if you
          are running this locally.
        </p>
      </div>
    </div>
  );
}
