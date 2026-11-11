import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { logoutAction } from "@/lib/admin/actions";
import { AdminNav } from "./admin-nav";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <header className="bg-brand-950 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo tone="light" href="/admin" />
            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-extrabold tracking-[0.14em] text-brand-200 uppercase ring-1 ring-white/15">
              Admin
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="hidden text-brand-100/80 sm:inline">{email}</span>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              View site
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut aria-hidden="true" className="size-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
        <nav aria-label="Admin sections" className="lg:w-52 lg:shrink-0">
          <AdminNav />
        </nav>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShellFallback() {
  return (
    <div role="status" aria-live="polite" className="flex flex-1 flex-col bg-canvas">
      <span className="sr-only">Checking your admin session</span>
      <div className="h-[4.15rem] bg-brand-950" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[13rem_1fr]">
        <div
          className="shimmer-surface hidden h-64 rounded-2xl border border-line lg:block"
          aria-hidden="true"
        />
        <div className="space-y-4">
          <div className="shimmer-surface h-28 rounded-2xl border border-line" aria-hidden="true" />
          <div className="shimmer-surface h-64 rounded-2xl border border-line" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
