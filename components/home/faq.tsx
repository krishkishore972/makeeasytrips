import { ChevronDown } from "lucide-react";
import type { HomeFaq } from "@/lib/home-content";

type FaqProps = {
  items: HomeFaq[];
};

/**
 * Native disclosure widgets keep the FAQ keyboard-accessible and readable
 * without JavaScript. The chevron only rotates, so motion stays cheap.
 */
export function Faq({ items }: FaqProps) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface px-5 shadow-xs sm:px-6">
      {items.map((item) => (
        <details key={item.question} className="group py-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-extrabold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-soft transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <p className="max-w-2xl pr-8 pb-5 text-sm leading-7 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
