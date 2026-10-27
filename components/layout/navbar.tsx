"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  BedDouble,
  CarFront,
  Globe2,
  Headphones,
  Heart,
  LogIn,
  MapPin,
  Palmtree,
  Plane,
  Tag,
  TrainFront,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { LoginDialog } from "@/components/layout/login-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/shared/logo";
import { useScrolled } from "@/hooks/use-scrolled";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  plane: Plane,
  bed: BedDouble,
  palmtree: Palmtree,
  train: TrainFront,
  car: CarFront,
  tag: Tag,
};

export function Navbar() {
  const scrolled = useScrolled(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-shadow duration-300",
        scrolled ? "shadow-sm" : "shadow-none",
      )}
    >
      {/* Utility strip */}
      <div className="hidden bg-brand-950 text-white lg:block">
        <div className="page-container flex h-9 items-center justify-between gap-6 text-[11px] font-semibold">
          <ul className="flex items-center gap-5">
            {siteConfig.utilityNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/75 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5 text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <Headphones aria-hidden="true" className="size-3.5" />
              24/7 demo support
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Globe2 aria-hidden="true" className="size-3.5" />
              India · INR
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="page-container flex h-[72px] items-center justify-between gap-3 sm:h-[76px]">
          <Logo className="shrink-0" />

          <Suspense fallback={<DesktopNavList pathname={null} />}>
            <DesktopNavActive />
          </Suspense>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              title="Currency: Indian Rupee"
              className="hidden items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-ink-soft md:inline-flex"
            >
              INR
            </span>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden size-10 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700 sm:grid"
            >
              <Heart aria-hidden="true" className="size-[19px]" />
            </Link>

            <LoginDialog
              trigger={
                <button
                  type="button"
                  className="hidden items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-800 sm:inline-flex"
                >
                  <UserRound aria-hidden="true" className="size-4" />
                  Sign in
                </button>
              }
            />

            <LoginDialog
              trigger={
                <button
                  type="button"
                  aria-label="Sign in"
                  className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-brand-50 sm:hidden"
                >
                  <LogIn aria-hidden="true" className="size-[18px]" />
                </button>
              }
            />

            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Presentational nav list. The active item needs `usePathname`, which is URL
 * data and must live inside a Suspense boundary so the shell can prerender.
 */
function DesktopNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-0.5">
        {siteConfig.navigation.map((item) => {
          const Icon = navIcons[item.icon] ?? MapPin;
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-ink-soft hover:bg-brand-50/70 hover:text-brand-800",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-[17px] transition-colors",
                    active ? "text-brand-600" : "text-muted-soft group-hover:text-brand-600",
                  )}
                />
                {item.label}
                {item.icon === "tag" ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent-500"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DesktopNavActive() {
  const pathname = usePathname();
  return <DesktopNavList pathname={pathname} />;
}
