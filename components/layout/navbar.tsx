"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  BedDouble,
  CarFront,
  CalendarDays,
  MapPin,
  Palmtree,
  Phone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/shared/logo";
import { useScrolled } from "@/hooks/use-scrolled";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  bed: BedDouble,
  palmtree: Palmtree,
  car: CarFront,
  tag: Tag,
  calendar: CalendarDays,
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
      {/* Main navigation */}
      <div className="border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="page-container flex h-[72px] items-center justify-between gap-3 sm:h-[76px]">
          <Logo className="shrink-0" />

          <Suspense fallback={<DesktopNavList pathname={null} />}>
            <DesktopNavActive />
          </Suspense>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-0.5 md:flex">
              <Phone aria-hidden="true" className="mr-1 size-3.5 text-brand-500" />
              {siteConfig.company.phones.map((phone, index) => (
                <span key={phone.href} className="inline-flex items-center">
                  {index > 0 ? (
                    <span aria-hidden="true" className="mx-0.5 h-3 w-px bg-line" />
                  ) : null}
                  <a
                    href={phone.href}
                    aria-label={`Call ${phone.label}`}
                    className="rounded-lg px-1.5 py-2 text-m font-bold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    {phone.label}
                  </a>
                </span>
              ))}
            </div>

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
