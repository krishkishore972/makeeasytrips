"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCatalogueAction } from "@/lib/admin/catalogue-delete";
import type { CatalogueResource } from "@/lib/admin/catalogue-config";

export function CatalogueDelete({
  resource,
  id,
  title,
}: {
  resource: CatalogueResource;
  id: string;
  title: string;
}) {
  const [state, action, pending] = useActionState(deleteCatalogueAction, {});
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete ${title}? This permanently deletes the listing and its unshared Cloudinary photos. Shared photos are kept. This cannot be undone.`,
          )
        )
          event.preventDefault();
      }}
      className="rounded-2xl border border-danger/30 bg-surface p-5"
    >
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="id" value={id} />
      <h2 className="text-sm font-extrabold text-danger">Delete listing</h2>
      <p className="mt-2 text-xs leading-5 text-muted">
        Permanently delete this listing and its Cloudinary photos. Photos used by another listing
        are kept.
      </p>
      {state.error ? (
        <p role="alert" className="mt-2 text-xs font-bold text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-danger/40 px-3 text-xs font-bold text-danger disabled:opacity-60"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {pending ? "Deleting…" : "Delete listing"}
      </button>
    </form>
  );
}
