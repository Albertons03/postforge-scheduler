'use client';

/**
 * Development-only component to show current breakpoint
 * Only visible when NODE_ENV === 'development'
 */
export function BreakpointIndicator() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white text-xs font-mono px-3 py-2 rounded-lg shadow-lg pointer-events-none">
      <div className="sm:hidden">XS (&lt;640px)</div>
      <div className="hidden sm:block md:hidden">SM (≥640px)</div>
      <div className="hidden md:block lg:hidden">MD (≥768px)</div>
      <div className="hidden lg:block xl:hidden">LG (≥1024px)</div>
      <div className="hidden xl:block 2xl:hidden">XL (≥1280px)</div>
      <div className="hidden 2xl:block">2XL (≥1536px)</div>
    </div>
  );
}
