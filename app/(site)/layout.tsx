import { Suspense } from "react";
import { LiveEventsBanner } from "@/components/events/live-events-banner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Public site shell. The admin area lives outside this route group so it does
 * not inherit the marketing navbar, footer, or newsletter sign-up.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <LiveEventsBanner />
      </Suspense>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
