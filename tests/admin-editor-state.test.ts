import { isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/admin/catalogue-form", () => ({ CatalogueForm: () => null }));
vi.mock("@/components/admin/catalogue-delete", () => ({ CatalogueDelete: () => null }));
vi.mock("@/lib/admin/session", () => ({ requireAdminSession: vi.fn() }));
vi.mock("@/lib/admin/catalogue-data", () => ({
  getCatalogueRecord: vi.fn(),
  listCatalogueRecords: vi.fn(),
}));
vi.mock("@/lib/data/cities", () => ({ getCities: vi.fn().mockResolvedValue([]) }));
vi.mock("next/server", () => ({ connection: vi.fn() }));

import { CatalogueForm } from "@/components/admin/catalogue-form";
import { CatalogueEditPage } from "@/components/admin/catalogue-pages";
import { getCatalogueRecord } from "@/lib/admin/catalogue-data";
import type { CatalogueResource } from "@/lib/admin/catalogue-config";

function findForm(node: ReactNode): ReactElement<{ record: Record<string, unknown> }> {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findFormOrNull(child);
      if (found) return found;
    }
  }
  const found = findFormOrNull(node);
  if (!found) throw new Error("CatalogueForm was not rendered");
  return found;
}

function findFormOrNull(node: ReactNode): ReactElement<{ record: Record<string, unknown> }> | null {
  if (!isValidElement<{ children?: ReactNode; record: Record<string, unknown> }>(node)) {
    return null;
  }
  if (node.type === CatalogueForm) return node;
  const children = node.props.children;
  if (!children) return null;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findFormOrNull(child);
    if (found) return found;
  }
  return null;
}

async function editForm(resource: CatalogueResource, record: Record<string, unknown>) {
  vi.mocked(getCatalogueRecord).mockResolvedValue(record);
  const page = await CatalogueEditPage({
    resource,
    params: Promise.resolve({ id: "listing" }),
  });
  // Render the server-only editor shell; leave the client form untouched.
  const shell = page.type as (props: typeof page.props) => ReactNode;
  return findForm(shell(page.props));
}

describe.each(["hotels", "holidays", "cars", "offers", "events"] as const)(
  "%s editor navigation state",
  (resource) => {
    beforeEach(() => vi.clearAllMocks());

    it("resets preserved form state when a saved main photo changes", async () => {
      const record = { id: "listing", image: "/old.jpg", gallery: ["/gallery.jpg"] };
      const before = await editForm(resource, record);
      const reopened = await editForm(resource, { ...record, image: "/replacement.jpg" });

      expect(reopened.props.record.image).toBe("/replacement.jpg");
      expect(reopened.key).not.toBe(before.key);
    });

    it("resets preserved gallery slots when a saved gallery photo changes", async () => {
      const record = { id: "listing", image: "/main.jpg", gallery: ["/old.jpg"] };
      const before = await editForm(resource, record);
      const reopened = await editForm(resource, { ...record, gallery: ["/replacement.jpg"] });

      expect(reopened.props.record.gallery).toEqual(["/replacement.jpg"]);
      expect(reopened.key).not.toBe(before.key);
    });

    it("keeps drafts when the server record has not changed", async () => {
      const record = { id: "listing", image: "/main.jpg", gallery: ["/gallery.jpg"] };
      const before = await editForm(resource, record);
      const reopened = await editForm(resource, { ...record });

      expect(reopened.key).toBe(before.key);
    });
  },
);
