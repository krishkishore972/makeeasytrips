import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AppProviders } from "@/components/providers/app-providers";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { siteConfig } from "@/lib/site";
import "react-day-picker/style.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "TripNest — Travel that feels like yours.",
    template: "%s · TripNest",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "TripNest Travel Labs" }],
  keywords: [
    "TripNest",
    "travel planning",
    "flights",
    "hotels",
    "holiday packages",
    "India travel",
    "Next.js travel app",
  ],
  category: "travel",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: "TripNest — Travel that feels like yours.",
    description: siteConfig.description,
    url: "/",
    images: [
      {
        url: "/images/hero-coast.svg",
        width: 1600,
        height: 1000,
        alt: "Abstract illustration of a coastline at dusk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TripNest — Travel that feels like yours.",
    description: siteConfig.description,
    images: ["/images/hero-coast.svg"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#04211f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="flex min-h-dvh flex-col bg-canvas text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand-950 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>

        {/* Framer Motion hides reveal targets until hydration; keep content readable without JS. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <AppProviders>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
