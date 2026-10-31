"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Send, ShieldCheck, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
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
  const nameErrorId = `${baseId}-name-error`;
  const phoneErrorId = `${baseId}-phone-error`;

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [lastUrl, setLastUrl] = useState("");
  const [values, setValues] = useState<EnquiryFormValues>({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSent(false);
      setLastUrl("");
      setErrors({});
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = enquiryFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
      });
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
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const context = (target.context ?? []).filter((line) => line.trim().length > 0);

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
                  {sent ? "Your enquiry is ready." : "Send an enquiry on WhatsApp."}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs leading-5 text-muted">
                  {sent
                    ? "WhatsApp should have opened with your message. Press send there to deliver it."
                    : `Tell us who you are and what you need. Your message goes to the TripNest business WhatsApp.`}
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
                <p className="mt-2 text-sm font-extrabold text-ink">
                  WhatsApp opened in a new tab.
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Press send in WhatsApp to deliver your enquiry. If the tab did not open, use the
                  button below.
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

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
                >
                  <Send aria-hidden="true" className="size-4" />
                  Send enquiry on WhatsApp
                </button>
              </form>

              <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500"
                />
                Your name and phone number are used only to reply on WhatsApp. The selected item and
                its details are included automatically. Nothing is stored on this site.
              </p>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
