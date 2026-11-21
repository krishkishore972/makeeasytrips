"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CarFront,
  Inbox,
  LayoutDashboard,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Hotels", href: "/admin/hotels", icon: Building2 },
  { label: "Holidays", href: "/admin/holidays", icon: CalendarDays },
  { label: "Cars", href: "/admin/cars", icon: CarFront },
  { label: "Offers", href: "/admin/offers", icon: Tag },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
];

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:overflow-visible">
      {navItems.map(({ label, href, icon: Icon }) => {
        const current = href ? isCurrent(pathname, href) : false;

        return (
          <li key={label} className="shrink-0">
            {href ? (
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-colors",
                  current
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-muted hover:bg-surface hover:text-ink",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Link>
            ) : (
              <span className="inline-flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-muted-soft">
                <Icon aria-hidden="true" className="size-4" />
                {label}
                <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[9px] tracking-[0.1em] text-brand-700 uppercase">
                  Soon
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
