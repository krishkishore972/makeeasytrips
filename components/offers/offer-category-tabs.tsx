import Link from "next/link";
import type { OfferCategory } from "@/lib/search-options";
import { cn } from "@/lib/utils";

type OfferCategoryTabsProps = {
  categories: { value: OfferCategory; label: string; count: number }[];
  active: OfferCategory;
  className?: string;
};

export function OfferCategoryTabs({ categories, active, className }: OfferCategoryTabsProps) {
  return (
    <nav aria-label="Offer categories" className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => {
        const isActive = category.value === active;
        const href = category.value === "all" ? "/offers" : `/offers?category=${category.value}`;

        return (
          <Link
            key={category.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition-colors",
              isActive
                ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                : "border-line bg-surface text-ink-soft hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800",
            )}
          >
            {category.label}
            <span
              className={cn(
                "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px]",
                isActive ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700",
              )}
            >
              {category.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
