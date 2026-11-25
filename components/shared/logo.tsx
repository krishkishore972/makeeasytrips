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
 * Mountain monogram, journey ribbon, and sun using the site's brand tokens.
 * Inline SVG keeps the mark crisp and adapts it to light and dark backgrounds.
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
      aria-label="Makeasytrips home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-offset-4",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center transition-transform duration-300 group-hover:-rotate-3",
          tone === "dark" ? "text-brand-900" : "text-white",
        )}
      >
        <svg viewBox="0 0 156 156" fill="none" aria-hidden="true" className="size-full">
          <g transform="translate(8 10)">
            <circle cx="108" cy="30" r="10" className="fill-gold-500" />
            <path
              d="M15 91 44 30C47 24 54 24 57 30L73 63 88 45C92 40 98 41 101 47L122 91"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 109C43 126 85 122 108 104 121 94 128 80 130 65"
              className="stroke-accent-400"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="m116 69 15-17 8 22-12-5-11 0Z"
              className={tone === "dark" ? "fill-brand-600" : "fill-brand-300"}
            />
          </g>
        </svg>
      </span>

      {showWordmark ? (
        <span
          className={cn(
            "inline-flex items-center font-sans text-[1.6rem] leading-none font-extrabold tracking-[-0.045em] whitespace-nowrap",
            tone === "dark" ? "text-brand-900" : "text-white",
          )}
        >
          <span>Makeasy</span>
          <span>trips</span>
        </span>
      ) : null}
    </Link>
  );
}
