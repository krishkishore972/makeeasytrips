import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingBadgeProps = {
  score: number;
  reviewCount?: number;
  className?: string;
  size?: "sm" | "md";
};

function ratingLabel(score: number) {
  if (score >= 9) return "Excellent";
  if (score >= 8.5) return "Very good";
  if (score >= 8) return "Good";
  return "Pleasant";
}

export function RatingBadge({ score, reviewCount, className, size = "md" }: RatingBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-brand-700 font-extrabold text-white",
          size === "sm" ? "px-1.5 py-1 text-[11px]" : "px-2 py-1.5 text-xs",
        )}
      >
        <Star aria-hidden="true" className="size-3 fill-current" />
        {score.toFixed(1)}
      </span>
      <span className="min-w-0">
        <span className={cn("block font-bold text-ink", size === "sm" ? "text-[11px]" : "text-xs")}>
          {ratingLabel(score)}
        </span>
        {reviewCount !== undefined ? (
          <span className="block text-[10px] leading-4 text-muted-soft">
            {reviewCount.toLocaleString("en-IN")} reviews
          </span>
        ) : null}
      </span>
    </div>
  );
}

type StarRatingProps = {
  rating: number;
  className?: string;
};

export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span
      role="img"
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating}-star property`}
    >
      {Array.from({ length: rating }, (_, index) => (
        <Star key={index} aria-hidden="true" className="size-3.5 fill-gold-500 text-gold-500" />
      ))}
    </span>
  );
}
