import { connection } from "next/server";
import { Suspense } from "react";
import {
  AdminStatsFallback,
  AdminStatsUnavailable,
  AdminStatsView,
} from "@/components/admin/admin-stats";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminStats, parseStatsRange } from "@/lib/admin/stats";

type AdminOverviewPageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default function AdminOverviewPage({ searchParams }: AdminOverviewPageProps) {
  return (
    <Suspense fallback={<AdminStatsFallback />}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: AdminOverviewPageProps) {
  // The layout already checked the session; checking again here keeps the page
  // safe if it is ever rendered through another route or layout.
  const session = await requireAdminSession();
  const params = await searchParams;
  const range = parseStatsRange(params.range);

  // Lead counts are intentionally dynamic: no catalogue-style process cache.
  await connection();

  const stats = await getAdminStats(range).catch((error: unknown) => {
    console.error("Failed to load admin stats", error);
    return null;
  });

  if (!stats) {
    return <AdminStatsUnavailable />;
  }

  return <AdminStatsView email={session.email} stats={stats} />;
}
