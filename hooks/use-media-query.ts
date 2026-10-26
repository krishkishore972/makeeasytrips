"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query. Returns false during SSR and the first
 * client render so markup stays deterministic, then updates after mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
