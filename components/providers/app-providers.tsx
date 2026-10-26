"use client";

import { MotionConfig } from "motion/react";
import { LenisProvider } from "@/components/providers/lenis-provider";

/**
 * Client-only providers live here so the root layout can remain a Server
 * Component. MotionConfig makes every animation respect the OS motion setting.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LenisProvider>{children}</LenisProvider>
    </MotionConfig>
  );
}
