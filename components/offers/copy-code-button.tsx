"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CopyCodeButtonProps = {
  code: string;
  className?: string;
};

type CopyStatus = "idle" | "copied" | "error";

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) throw new Error("Copy command was rejected");
}

export function CopyCodeButton({ code, className }: CopyCodeButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copyCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        fallbackCopy(code);
      }
      setStatus("copied");
    } catch {
      try {
        fallbackCopy(code);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
    }

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <>
      <button
        type="button"
        onClick={copyCode}
        aria-label={`Copy offer code ${code}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-dashed bg-surface/70 px-2.5 py-1.5 font-mono text-[11px] font-extrabold tracking-[0.08em] transition-colors hover:bg-surface",
          className,
        )}
      >
        {code}
        {status === "copied" ? (
          <Check aria-hidden="true" className="size-3.5" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {status === "copied" ? "Offer code copied" : null}
        {status === "error" ? "Could not copy the code. Select it manually." : null}
      </span>
    </>
  );
}
