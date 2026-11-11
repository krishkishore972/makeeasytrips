"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-xs transition-colors placeholder:text-muted-soft/70 hover:border-line-strong focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted-soft";

const controlInvalid = "border-danger/70 focus:border-danger";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Label, hint, and error wrapper with matching ids. Inputs receive the ids via
 * `describedBy` so screen readers announce both the help text and the error.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-center gap-1 text-xs font-extrabold text-ink-soft">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> required</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[11px] leading-5 font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescribedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

type TextInputProps = ComponentProps<"input"> & {
  invalid?: boolean;
  describedBy?: string;
};

export function TextInput({ className, invalid, describedBy, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(controlBase, invalid && controlInvalid, className)}
    />
  );
}

type TextAreaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
  describedBy?: string;
};

export function TextArea({ className, invalid, describedBy, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(controlBase, "min-h-28 resize-y", invalid && controlInvalid, className)}
    />
  );
}

type SelectProps = ComponentProps<"select"> & {
  invalid?: boolean;
  describedBy?: string;
};

export function Select({ className, invalid, describedBy, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(controlBase, "pr-8", invalid && controlInvalid, className)}
    >
      {children}
    </select>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
} & Omit<ComponentProps<"input">, "type" | "id">;

export function CheckboxField({ id, label, hint, error, className, ...props }: CheckboxFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-2.5">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          className="mt-0.5 size-4 shrink-0 rounded border-line-strong text-brand-700 accent-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <label htmlFor={id} className="text-xs leading-5 font-bold text-ink-soft">
          {label}
        </label>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="pl-6.5 text-[11px] leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="pl-6.5 text-[11px] leading-5 font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FormMessageProps = {
  tone?: "error" | "success" | "info";
  children?: ReactNode;
  className?: string;
};

export function FormMessage({ tone = "error", children, className }: FormMessageProps) {
  if (!children) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "rounded-xl px-3 py-2 text-xs leading-5 font-semibold",
        tone === "error" && "bg-danger-soft text-danger",
        tone === "success" && "bg-success-soft text-success",
        tone === "info" && "bg-brand-50 text-brand-800",
        className,
      )}
    >
      {children}
    </p>
  );
}
