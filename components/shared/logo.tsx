import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  tone?: "dark" | "light";
  showWordmark?: boolean;
  href?: string;
  onClick?: () => void;
};

/**
 * Original TripNest mark: a horizon line cradled by two nest arcs with a coral
 * sun. No third-party logo or sprite is used.
 */
export function Logo({
  className,
  tone = "dark",
  showWordmark = true,
  href = "/",
  onClick,
}: LogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="TripNest home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-offset-4",
        className,
      )}
    >
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] transition-transform duration-300 group-hover:-rotate-3",
          tone === "dark"
            ? "bg-brand-700 text-white shadow-sm"
            : "bg-white/12 text-white ring-1 ring-white/20 backdrop-blur",
        )}
      >
        <svg viewBox="0 0 40 40" aria-hidden="true" className="size-8">
          <circle cx="20" cy="12.5" r="3.1" fill="#FF6B4A" />
          <path
            d="M7.5 25.5c3.6-7.2 8.4-10.8 12.5-10.8s8.9 3.6 12.5 10.8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path
            d="M11.5 30c2.9-4.6 5.7-6.8 8.5-6.8s5.6 2.2 8.5 6.8"
            fill="none"
            opacity="0.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </span>

      {showWordmark ? (
        <span
          className={cn(
            "font-display text-[1.6rem] leading-none font-semibold tracking-[-0.035em]",
            tone === "dark" ? "text-ink" : "text-white",
          )}
        >
          TripNest
          <span className="text-accent-500">.</span>
        </span>
      ) : null}
    </Link>
  );
}
