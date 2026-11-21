"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Loader2, Send, ShieldCheck, X } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import {
  buildWhatsAppEnquiryMessage,
  ENQUIRY_SERVICE_LABELS,
  enquiryFormSchema,
  whatsappEnquiryUrl,
  type EnquiryFormValues,
  type EnquiryTarget,
} from "@/lib/enquiry";
import { cn } from "@/lib/utils";

type EnquiryDialogProps = {
  target: EnquiryTarget;
  label?: string;
  variant?: "whatsapp" | "brand" | "outline";
  size?: "md" | "sm";
  className?: string;
};

type FieldErrors = Partial<Record<keyof EnquiryFormValues, string>>;

const triggerVariants = {
  whatsapp: "bg-success text-white shadow-sm hover:bg-brand-800",
  brand: "bg-brand-700 text-white shadow-sm hover:bg-brand-800",
  outline: "border border-brand-200 bg-surface text-brand-800 hover:bg-brand-50",
} as const;

const triggerSizes = {
  md: "min-h-11 px-5 text-sm",
  sm: "min-h-9 px-4 text-xs",
} as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.05 2a9.94 9.94 0 0 0-8.51 15.09L2.1 22l5.04-1.41a9.93 9.93 0 0 0 4.91 1.29h.01A9.94 9.94 0 0 0 12.05 2Zm0 18.15a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.87.84-3.03-.2-.31a8.21 8.21 0 1 1 6.95 3.79Z" />
    </svg>
  );
}

const fieldClassName =
  "mt-1.5 w-full rounded-xl border bg-surface px-3 text-sm font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-muted-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function EnquiryDialog({
  target,
  label = "Enquire on WhatsApp",
  variant = "whatsapp",
  size = "md",
  className,
}: EnquiryDialogProps) {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const phoneId = `${baseId}-phone`;
  const detailsId = `${baseId}-details`;
  const detailsErrorId = `${baseId}-details-error`;
  const nameErrorId = `${baseId}-name-error`;
  const phoneErrorId = `${baseId}-phone-error`;

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [lastUrl, setLastUrl] = useState("");
  const [values, setValues] = useState<EnquiryFormValues>({
    name: "",
    phone: "",
    details: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const pendingWindowRef = useRef<Window | null>(null);

  const context = (target.context ?? []).filter((line) => line.trim().length > 0);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      pendingWindowRef.current?.close();
      pendingWindowRef.current = null;
      setSent(false);
      setLastUrl("");
      setErrors({});
      setSaving(false);
      setSubmitError("");
    }
  }

  function updateField(field: keyof EnquiryFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const parsed = enquiryFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        details: fieldErrors.details?.[0],
      });
      return;
    }

    setSaving(true);
    setSubmitError("");

    // Open the tab inside the submit gesture. Some browsers block window.open
    // after an await, which would break the WhatsApp hand-off on a slow save.
    pendingWindowRef.current = window.open("about:blank", "_blank");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone,
          details: parsed.data.details,
          service: target.service,
          title: target.title,
          context,
          itemId: target.itemId,
          itemHref: target.itemHref,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        pendingWindowRef.current?.close();
        pendingWindowRef.current = null;
        setSubmitError(payload?.error ?? "We couldn't save your enquiry. Please try again.");
        return;
      }

      const url = whatsappEnquiryUrl(
        buildWhatsAppEnquiryMessage({
          ...parsed.data,
          target,
        }),
      );

      setLastUrl(url);
      setSent(true);

      if (pendingWindowRef.current) {
        pendingWindowRef.current.opener = null;
        pendingWindowRef.current.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }

      pendingWindowRef.current = null;
    } catch {
      pendingWindowRef.current?.close();
      pendingWindowRef.current = null;
      setSubmitError("We couldn't save your enquiry. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
            triggerVariants[variant],
            triggerSizes[size],
            className,
          )}
        >
          <WhatsAppIcon className="size-4 shrink-0" />
          {label}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-[80] bg-brand-950/55 backdrop-blur-[2px]" />
        <Dialog.Content
          data-lenis-prevent
          className="dialog-content fixed top-1/2 left-1/2 z-[90] max-h-[90dvh] w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-lg sm:p-6"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
                <WhatsAppIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="text-xl leading-tight">
                  {sent ? "Your enquiry is saved." : "Send an enquiry on WhatsApp."}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs leading-5 text-muted">
                  {sent
                    ? "WhatsApp should have opened with your message. Press send there to deliver it."
                    : "Tell us who you are and what you need. We save the enquiry and open WhatsApp so you can send it to the Makeasytrips business number."}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              aria-label="Close enquiry form"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-brand-50"
            >
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </div>

          {sent ? (
            <div className="mt-4">
              <div className="rounded-xl border border-success/20 bg-success-soft p-4 text-center">
                <CheckCircle2 aria-hidden="true" className="mx-auto size-7 text-success" />
                <p className="mt-2 text-sm font-extrabold text-ink">Your enquiry has been saved.</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  WhatsApp opened in a new tab. Press send there to deliver the same details. If the
                  tab did not open, use the button below.
                </p>
                {lastUrl ? (
                  <a
                    href={lastUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-success px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
                  >
                    <WhatsAppIcon className="size-4" />
                    Open WhatsApp
                  </a>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-surface px-4 text-xs font-extrabold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                >
                  Edit your details
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-700 px-4 text-xs font-extrabold text-white transition-colors hover:bg-brand-800"
                  >
                    Close
                  </button>
                </Dialog.Close>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-3">
                <p className="text-[10px] font-extrabold tracking-[0.12em] text-brand-700 uppercase">
                  {ENQUIRY_SERVICE_LABELS[target.service]} enquiry
                </p>
                <p className="mt-1 text-sm font-extrabold text-ink">{target.title}</p>
                {context.length > 0 ? (
                  <ul className="mt-2 space-y-0.5 text-[11px] leading-5 text-muted">
                    {context.map((line, index) => (
                      <li key={`${line}-${index}`}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor={nameId}
                    className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                  >
                    Your name
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? nameErrorId : undefined}
                    placeholder="e.g. Ananya Rao"
                    className={cn(
                      fieldClassName,
                      "h-11",
                      errors.name ? "border-danger" : "border-line",
                    )}
                  />
                  {errors.name ? (
                    <p
                      id={nameErrorId}
                      role="alert"
                      className="mt-1.5 text-[11px] font-bold text-danger"
                    >
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={phoneId}
                    className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                  >
                    Phone number
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? phoneErrorId : undefined}
                    placeholder="10-digit mobile number"
                    className={cn(
                      fieldClassName,
                      "h-11",
                      errors.phone ? "border-danger" : "border-line",
                    )}
                  />
                  {errors.phone ? (
                    <p
                      id={phoneErrorId}
                      role="alert"
                      className="mt-1.5 text-[11px] font-bold text-danger"
                    >
                      {errors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={detailsId}
                    className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                  >
                    Enquiry details <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    id={detailsId}
                    name="details"
                    rows={4}
                    maxLength={2000}
                    value={values.details ?? ""}
                    onChange={(event) => updateField("details", event.target.value)}
                    aria-invalid={Boolean(errors.details)}
                    aria-describedby={errors.details ? detailsErrorId : undefined}
                    placeholder={
                      target.service === "event"
                        ? "Tell us your preferred date, number of guests, and what you would like us to organise in Goa."
                        : "Tell us what you would like to know."
                    }
                    className={cn(
                      fieldClassName,
                      "py-3",
                      errors.details ? "border-danger" : "border-line",
                    )}
                  />
                  {errors.details ? (
                    <p id={detailsErrorId} role="alert" className="mt-1.5 text-xs text-danger">
                      {errors.details}
                    </p>
                  ) : null}
                </div>

                {submitError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-[11px] leading-5 font-bold text-danger"
                  >
                    {submitError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                      Saving your details…
                    </>
                  ) : (
                    <>
                      <Send aria-hidden="true" className="size-4" />
                      Save and open WhatsApp
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500"
                />
                Your name, phone number, and this enquiry are saved so the Makeasytrips team can
                follow up. They are not shared with anyone else. WhatsApp opens with the same
                details so you can send the message.
              </p>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
