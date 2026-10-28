import Link from "next/link";
import { ArrowUpRight, Globe2, LockKeyhole, ShieldCheck } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

const columns = [
  { title: "Explore", links: siteConfig.footer.explore },
  { title: "Company", links: siteConfig.footer.company },
  { title: "Support", links: siteConfig.footer.support },
  { title: "Legal", links: siteConfig.footer.legal },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-container py-14 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-5 text-sm leading-7 text-muted">
              Thoughtful trips, clearly planned. Find a stay with character, shape a holiday, or
              pick up a self-drive car for the road between.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-xs font-extrabold tracking-[0.14em] text-ink uppercase">
                The TripNest letter
              </p>
              <NewsletterForm />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 aria-hidden="true" className="size-3.5 text-brand-500" />
                India · INR
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="size-3.5 text-brand-500" />
                Demo checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole aria-hidden="true" className="size-3.5 text-brand-500" />
                No real payments
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-extrabold tracking-[0.14em] text-ink uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand-700"
                    >
                      {link.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-3.5 opacity-0 transition-all group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span>© 2026 TripNest Travel Labs</span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-line sm:block" />
            <span>Built for learning, not for booking.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ul className="flex flex-wrap items-center gap-4">
              {siteConfig.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs font-bold text-muted transition-colors hover:text-brand-700"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <span aria-hidden="true" className="hidden h-3 w-px bg-line sm:block" />
            <p className="max-w-md text-[11px] leading-5 text-muted-soft">
              TripNest is an independent learning project. It is not affiliated with, endorsed by,
              or connected to any travel brand.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
