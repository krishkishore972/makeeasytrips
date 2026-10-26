"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Initialise Lenis exactly once for the document.
 *
 * - Respects `prefers-reduced-motion`: no Lenis instance is created and the
 *   browser's native scrolling is left untouched.
 * - Re-evaluates the media query if the user changes the OS setting.
 * - Handles same-page anchor links with a header offset.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };

    const start = () => {
      if (media.matches || lenis) return;

      lenis = new Lenis({
        autoRaf: true,
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        anchors: { offset: -96 },
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      });
    };

    const onChange = () => {
      if (media.matches) stop();
      else start();
    };

    start();
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return children;
}
