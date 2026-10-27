import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, actions, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center sm:p-12",
        className,
      )}
    >
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        {icon ?? <SearchX aria-hidden="true" className="size-6" />}
      </span>
      <h2 className="mt-5 text-2xl leading-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
