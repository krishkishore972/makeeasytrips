import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: {
    label: string;
    href: string;
  };
  className?: string;
  titleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start",
        action && !centered ? "sm:flex-row sm:items-end sm:justify-between" : "",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2
          className={cn(
            "text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.12] font-semibold",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-muted sm:text-[1.0625rem]">{description}</p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-brand-700 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50"
        >
          {action.label}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
