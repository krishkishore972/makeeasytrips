import { cn } from "@/lib/utils";

type SearchFieldProps = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  className?: string;
  hint?: string;
};

export function SearchField({
  id,
  label,
  icon: Icon,
  children,
  className,
  hint,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center gap-1 rounded-xl border border-line bg-canvas px-3 py-2 transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100",
        className,
      )}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
      >
        <Icon aria-hidden={true} className="size-3" />
        {label}
      </label>
      {children}
      {hint ? <span className="text-[10px] leading-4 text-muted-soft">{hint}</span> : null}
    </div>
  );
}

export const searchInputClassName =
  "h-7 w-full min-w-0 bg-transparent text-[13px] font-bold text-ink outline-none placeholder:text-muted-soft";
