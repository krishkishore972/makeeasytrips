import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-700"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.label}-${item.href ?? "current"}`} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-muted-soft">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
