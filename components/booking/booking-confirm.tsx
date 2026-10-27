import { ArrowRight, LockKeyhole } from "lucide-react";
import { bookingParams } from "@/lib/booking";
import type { BookingSelection } from "@/lib/validation/booking";

type BookingConfirmProps = {
  selection: BookingSelection;
};

/**
 * A native GET form keeps the confirmation linkable without a server action,
 * session, database, or any collected personal details.
 */
export function BookingConfirm({ selection }: BookingConfirmProps) {
  const params = bookingParams(selection);

  return (
    <form
      action="/booking/confirmation"
      method="get"
      className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
    >
      {Object.entries(params).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="hidden" name="confirmed" value="1" />

      <p className="eyebrow">One last step</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Confirm to generate a demo reference for this selection. You can bookmark or share the
        confirmation URL.
      </p>

      <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-canvas p-3 text-[11px] leading-5 text-ink-soft">
        <input
          type="checkbox"
          name="acknowledge"
          value="1"
          required
          className="mt-0.5 size-4 shrink-0 accent-brand-700"
        />
        <span>
          I understand this is a learning demo. No payment is taken and no real booking is created.
        </span>
      </label>

      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
      >
        Confirm demo booking
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
        <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
        No name, email, phone number, or card details are requested.
      </p>
    </form>
  );
}
