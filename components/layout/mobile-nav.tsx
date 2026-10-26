"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BedDouble,
  CarFront,
  ChevronRight,
  Headphones,
  Heart,
  MapPin,
  Menu,
  Palmtree,
  Plane,
  Tag,
  TrainFront,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

const navIcons: Record<string, LucideIcon> = {
  plane: Plane,
  bed: BedDouble,
  palmtree: Palmtree,
  train: TrainFront,
  car: CarFront,
  tag: Tag,
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-brand-50 lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-[70] bg-brand-950/55 backdrop-blur-[2px]" />
        <Dialog.Content className="dialog-sheet fixed inset-y-0 right-0 z-[80] flex w-[min(88vw,24rem)] flex-col overflow-y-auto bg-surface p-5 shadow-lg">
          <Dialog.Title className="sr-only">TripNest navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Browse flights, hotels, holidays, trains, cabs, and offers.
          </Dialog.Description>

          <div className="flex items-center justify-between gap-4">
            <Logo onClick={close} />
            <Dialog.Close
              aria-label="Close navigation menu"
              className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-brand-50"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile primary" className="mt-7">
            <p className="eyebrow mb-3">Where to next?</p>
            <ul className="grid grid-cols-2 gap-2.5">
              {siteConfig.navigation.map((item) => {
                const Icon = navIcons[item.icon] ?? MapPin;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`group flex h-full flex-col gap-3 rounded-xl border p-3.5 transition-colors ${
                        active
                          ? "border-brand-200 bg-brand-50 text-brand-800"
                          : "border-line bg-canvas text-ink hover:border-brand-200 hover:bg-brand-50"
                      }`}
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-surface text-brand-700 shadow-xs">
                        <Icon aria-hidden="true" className="size-[18px]" />
                      </span>
                      <span className="flex items-center justify-between gap-2 text-sm font-bold">
                        {item.label}
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 text-muted-soft transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
            <p className="text-xs font-bold tracking-wide text-muted uppercase">Your account</p>
            <ul className="mt-3 space-y-1">
              {siteConfig.utilityNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" className="size-4 text-muted-soft" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <Headphones aria-hidden="true" className="size-4 text-brand-500" />
              24/7 demo support · India · INR
            </div>
            <p className="text-[11px] leading-5 text-muted-soft">
              TripNest is a learning project. No bookings, payments, or accounts are real.
            </p>
            <Link
              href="/wishlist"
              onClick={close}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 underline-offset-4 hover:underline"
            >
              <Heart aria-hidden="true" className="size-4" />
              View your wishlist
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
