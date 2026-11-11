import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NotFoundContent } from "@/components/shared/not-found-content";

/**
 * Fallback for URLs that match no route at all. Route-group layouts do not run
 * here, so the public chrome is rendered explicitly.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
