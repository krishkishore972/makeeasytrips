import { Suspense } from "react";
import { AdminShell, AdminShellFallback } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/session";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
