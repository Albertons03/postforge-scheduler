'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media queries
 * Returns true if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile screens
 * Returns true for screens < 640px
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 639px)');
}

/**
 * Convenience hook for tablet screens
 * Returns true for screens between 640px and 1023px
 */
export function useIsTablet() {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/**
 * Convenience hook for desktop screens
 * Returns true for screens >= 1024px
 */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Convenience hook for touch devices
 * Returns true for devices with touch as primary input
 */
export function useIsTouchDevice() {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}
