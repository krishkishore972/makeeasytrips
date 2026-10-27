"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Update URL search params without leaving the route. Filters, sort order, and
 * paging state all live in the URL so the server can render the result set.
 */
export function useSearchParamsUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function setParam(key: string, value: string | null) {
    setParams({ [key]: value });
  }

  function toggleListParam(key: string, value: string) {
    const current = (searchParams.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setParams({ [key]: next.length > 0 ? next.join(",") : null });
  }

  function toggleFlag(key: string) {
    setParams({ [key]: searchParams.get(key) === "1" ? null : "1" });
  }

  function clearParams(keys: string[]) {
    setParams(Object.fromEntries(keys.map((key) => [key, null])));
  }

  return {
    searchParams,
    isPending,
    setParams,
    setParam,
    toggleListParam,
    toggleFlag,
    clearParams,
  };
}
