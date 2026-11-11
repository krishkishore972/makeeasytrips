"use client";

import { useActionState, useState } from "react";
import { updateEnquiryStatusAction } from "@/lib/admin/enquiry-actions";
import { enquiryStatusValues, type EnquiryStatus } from "@/lib/admin/enquiry-status";

export function EnquiryStatusForm({ id, status }: { id: string; status: EnquiryStatus }) {
  const [state, action, pending] = useActionState(updateEnquiryStatusAction, {});
  const [value, setValue] = useState(status);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="enquiry-status" className="block text-xs font-extrabold text-ink-soft">
        Status
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id="enquiry-status"
          name="status"
          value={value}
          onChange={(event) => setValue(event.target.value as EnquiryStatus)}
          className="min-h-10 rounded-xl border border-line bg-surface px-3 text-sm"
        >
          {enquiryStatusValues.map((item) => (
            <option value={item} key={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        <button
          disabled={pending}
          className="min-h-10 rounded-xl bg-brand-700 px-4 text-xs font-extrabold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Update status"}
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="text-xs font-bold text-danger">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-xs font-bold text-success">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
