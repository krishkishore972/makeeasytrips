"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { contactSubmissionSchema } from "@/lib/validation/forms";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "phone" | "message";
type FieldErrors = Partial<Record<Field, string>>;

const initialValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const fieldClassName =
  "mt-1.5 w-full rounded-xl border bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const labelClassName = "text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase";

export function ContactForm() {
  const baseId = useId();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);

  function updateField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError("");
  }

  function fieldErrorId(field: Field) {
    return `${baseId}-${field}-error`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const parsed = contactSubmissionSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: nextErrors.name?.[0],
        email: nextErrors.email?.[0],
        phone: nextErrors.phone?.[0],
        message: nextErrors.message?.[0],
      });
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(payload?.error ?? "We couldn't send your message. Please try again.");
        return;
      }

      setValues(initialValues);
      setSent(true);
    } catch {
      setSubmitError("We couldn't send your message. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-success/20 bg-success-soft p-6 text-center"
      >
        <CheckCircle2 aria-hidden="true" className="mx-auto size-8 text-success" />
        <p className="mt-3 text-base font-extrabold text-ink">Thanks — your message is saved.</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
          The TripNest team can now read it and reply to the email address you gave. Nothing else
          was stored.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-surface px-4 text-xs font-extrabold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby={`${baseId}-heading`} className="mt-10">
      <h2 id={`${baseId}-heading`} className="text-2xl leading-tight">
        Send a message
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        This form is saved to the TripNest database so the team can follow up. Add a phone number if
        you would rather be called.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${baseId}-name`} className={labelClassName}>
            Your name
          </label>
          <input
            id={`${baseId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? fieldErrorId("name") : undefined}
            placeholder="e.g. Ananya Rao"
            className={cn(fieldClassName, "h-11", errors.name ? "border-danger" : "border-line")}
          />
          {errors.name ? (
            <p
              id={fieldErrorId("name")}
              role="alert"
              className="mt-1.5 text-[11px] font-bold text-danger"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-email`} className={labelClassName}>
            Email address
          </label>
          <input
            id={`${baseId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? fieldErrorId("email") : undefined}
            placeholder="you@example.com"
            className={cn(fieldClassName, "h-11", errors.email ? "border-danger" : "border-line")}
          />
          {errors.email ? (
            <p
              id={fieldErrorId("email")}
              role="alert"
              className="mt-1.5 text-[11px] font-bold text-danger"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-phone`} className={labelClassName}>
            Phone number <span className="font-semibold normal-case">(optional)</span>
          </label>
          <input
            id={`${baseId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? fieldErrorId("phone") : undefined}
            placeholder="10-digit mobile number"
            className={cn(fieldClassName, "h-11", errors.phone ? "border-danger" : "border-line")}
          />
          {errors.phone ? (
            <p
              id={fieldErrorId("phone")}
              role="alert"
              className="mt-1.5 text-[11px] font-bold text-danger"
            >
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-message`} className={labelClassName}>
            Your message
          </label>
          <textarea
            id={`${baseId}-message`}
            name="message"
            rows={5}
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? fieldErrorId("message") : undefined}
            placeholder="Tell us what you need help with."
            className={cn(
              fieldClassName,
              "resize-y py-2.5 leading-6",
              errors.message ? "border-danger" : "border-line",
            )}
          />
          {errors.message ? (
            <p
              id={fieldErrorId("message")}
              role="alert"
              className="mt-1.5 text-[11px] font-bold text-danger"
            >
              {errors.message}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p
            role="alert"
            className="rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-[11px] leading-5 font-bold text-danger sm:col-span-2"
          >
            {submitError}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Sending your message…
              </>
            ) : (
              <>
                <Send aria-hidden="true" className="size-4" />
                Send message
              </>
            )}
          </button>
          <p className="mt-2 text-[11px] leading-5 text-muted-soft">
            We store your name, email, optional phone number, and message so we can reply. We never
            sell or share these details.
          </p>
        </div>
      </form>
    </section>
  );
}
