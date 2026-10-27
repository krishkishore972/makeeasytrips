import { cn } from "@/lib/utils";

const tones = [
  "bg-brand-700",
  "bg-accent-600",
  "bg-gold-600",
  "bg-brand-500",
  "bg-brand-900",
  "bg-accent-700",
];

type AirlineMarkProps = {
  code: string;
  className?: string;
  size?: "sm" | "md";
};

export function AirlineMark({ code, className, size = "md" }: AirlineMarkProps) {
  const index = (code.charCodeAt(0) + code.charCodeAt(code.length - 1)) % tones.length;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-xl font-extrabold tracking-wide text-white shadow-xs",
        size === "sm" ? "size-8 text-[10px]" : "size-10 text-[11px]",
        tones[index],
        className,
      )}
    >
      {code}
    </span>
  );
}
