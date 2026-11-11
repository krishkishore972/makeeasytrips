import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, BarChart3, ImageIcon, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { safeAdminRedirect } from "@/lib/admin/redirect";
import { LoginForm } from "./login-form";

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Admin sign in",
};

const highlights = [
  {
    icon: ShieldCheck,
    title: "Admin-only session",
    detail: "Signed JWT in an HttpOnly, SameSite=Strict cookie. No customer accounts.",
  },
  {
    icon: BarChart3,
    title: "Enquiry stats next",
    detail: "Popular stays, packages, and cars, plus newsletter and contact totals.",
  },
  {
    icon: ImageIcon,
    title: "Cloudinary media",
    detail: "Server-signed uploads for hotel, holiday, car, and offer photography.",
  },
] as const;

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <main id="main-content" tabIndex={-1} className="grid flex-1 lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-700/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-accent-500/15 blur-3xl"
        />

        <div className="relative">
          <Logo tone="light" href="/" />
          <p className="mt-10 text-[10px] font-extrabold tracking-[0.18em] text-brand-300 uppercase">
            Makeasytrips operations
          </p>
          <h2 className="mt-3 max-w-md font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.05] font-semibold">
            The quiet back office for a thoughtful travel catalogue.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-brand-100/80">
            One admin account manages content, media, and the enquiries that arrive from the public
            site. Visitors never need to sign in.
          </p>
        </div>

        <ul className="relative mt-12 space-y-5">
          {highlights.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-white/15">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-white">{title}</p>
                <p className="mt-0.5 max-w-xs text-xs leading-5 text-brand-100/70">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo href="/" />
          </div>

          <p className="eyebrow mt-8 lg:mt-0">Staff only</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.6rem)] leading-tight">Admin sign in</h1>
          <p className="mt-2 text-sm leading-7 text-muted">
            Use the single admin email and password configured for this deployment. Public visitors
            keep browsing without an account.
          </p>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginPanel searchParams={searchParams} />
          </Suspense>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-xs font-extrabold text-brand-700 transition-colors hover:text-brand-800"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to the public site
          </Link>
        </div>
      </section>
    </main>
  );
}

async function LoginPanel({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return <LoginForm next={safeAdminRedirect(next)} />;
}

function LoginFormFallback() {
  return (
    <div role="status" aria-live="polite" className="mt-8 space-y-4">
      <span className="sr-only">Loading the admin sign-in form</span>
      <div
        className="shimmer-surface h-[4.65rem] rounded-xl border border-line"
        aria-hidden="true"
      />
      <div
        className="shimmer-surface h-[4.65rem] rounded-xl border border-line"
        aria-hidden="true"
      />
      <div className="shimmer-surface h-11 rounded-xl border border-line" aria-hidden="true" />
    </div>
  );
}
