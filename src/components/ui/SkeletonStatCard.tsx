import React from 'react';

/**
 * SkeletonStatCard Component
 *
 * Loading skeleton placeholder for StatCard components with shimmer animation.
 * Matches exact dimensions and layout of real StatCard to prevent layout shift.
 *
 * @param variant - 'default' | 'hero' - Size variant matching StatCard
 */

interface SkeletonStatCardProps {
  variant?: 'default' | 'hero';
}

export const SkeletonStatCard: React.FC<SkeletonStatCardProps> = ({ variant = 'default' }) => {
  const isHero = variant === 'hero';

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50
        ${isHero ? 'p-8 md:p-10' : 'p-4 sm:p-6'}
      `}
      role="status"
      aria-label="Loading credit statistics"
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer-loading bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
        aria-hidden="true"
      />

      {/* Content skeleton */}
      <div className="relative z-10 space-y-4">
        {/* Icon skeleton */}
        <div
          className={`
            rounded-lg bg-gray-800/80
            ${isHero ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12'}
          `}
          aria-hidden="true"
        />

        {/* Label skeleton */}
        <div
          className={`
            rounded bg-gray-800/80
            ${isHero ? 'h-5 w-32 md:h-6 md:w-40' : 'h-4 w-28'}
          `}
          aria-hidden="true"
        />

        {/* Value skeleton */}
        <div
          className={`
            rounded bg-gray-800/80
            ${isHero ? 'h-10 w-24 md:h-12 md:w-32' : 'h-8 w-20'}
          `}
          aria-hidden="true"
        />
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonStatCard;
