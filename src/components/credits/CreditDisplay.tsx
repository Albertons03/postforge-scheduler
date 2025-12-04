'use client';

import { Zap } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface CreditDisplayProps {
  credits: number;
  onClick: () => void;
  compact?: boolean;
}

export default function CreditDisplay({
  credits,
  onClick,
  compact = false
}: CreditDisplayProps) {
  const getColorClasses = () => {
    if (credits > 20) {
      return {
        bg: 'from-emerald-600 to-teal-600',
        hoverBg: 'hover:from-emerald-700 hover:to-teal-700',
        shadow: 'shadow-emerald-500/30',
        hoverShadow: 'hover:shadow-emerald-500/40',
        border: 'border-emerald-500/50',
        hoverBorder: 'hover:border-emerald-400',
        darkBg: 'dark:from-emerald-500 dark:to-teal-500',
        iconColor: 'text-emerald-100',
        ring: 'focus:ring-emerald-500/50',
      };
    } else if (credits >= 5) {
      return {
        bg: 'from-amber-600 to-orange-600',
        hoverBg: 'hover:from-amber-700 hover:to-orange-700',
        shadow: 'shadow-amber-500/30',
        hoverShadow: 'hover:shadow-amber-500/40',
        border: 'border-amber-500/50',
        hoverBorder: 'hover:border-amber-400',
        darkBg: 'dark:from-amber-500 dark:to-orange-500',
        iconColor: 'text-amber-100',
        ring: 'focus:ring-amber-500/50',
      };
    } else {
      return {
        bg: 'from-rose-600 to-red-600',
        hoverBg: 'hover:from-rose-700 hover:to-red-700',
        shadow: 'shadow-rose-500/30',
        hoverShadow: 'hover:shadow-rose-500/40',
        border: 'border-rose-500/50',
        hoverBorder: 'hover:border-rose-400',
        darkBg: 'dark:from-rose-500 dark:to-red-500',
        iconColor: 'text-rose-100',
        ring: 'focus:ring-rose-500/50',
      };
    }
  };

  const colors = getColorClasses();

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className={`
              group relative overflow-hidden
              bg-gradient-to-r ${colors.bg} ${colors.hoverBg} ${colors.darkBg}
              ${compact ? 'p-3' : 'px-5 py-3'}
              rounded-xl
              border-2 ${colors.border} ${colors.hoverBorder}
              shadow-lg ${colors.shadow} ${colors.hoverShadow}
              transition-all duration-300
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 ${colors.ring}
            `}
            aria-label={`Current balance: ${credits} credits. Click to purchase more credits.`}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className={`relative flex items-center ${compact ? 'justify-center' : 'justify-start space-x-2.5'}`}>
              <Zap
                className={`
                  ${compact ? 'w-5 h-5' : 'w-5 h-5'}
                  ${colors.iconColor}
                  group-hover:rotate-12
                  transition-transform duration-300
                  flex-shrink-0
                `}
                fill="currentColor"
                aria-hidden="true"
              />

              {!compact && (
                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-base leading-tight">
                    {credits}
                  </span>
                  <span className="text-white/90 font-medium text-xs leading-tight">
                    {credits === 1 ? 'Credit' : 'Credits'}
                  </span>
                </div>
              )}
            </div>
          </button>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="center"
            sideOffset={8}
            className="
              z-50
              px-4 py-2.5
              bg-slate-800/95 backdrop-blur-lg
              border border-slate-700/50
              text-white text-sm font-medium
              rounded-lg
              shadow-xl shadow-black/20
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            "
          >
            {credits < 5 ? (
              <>
                <span className="text-rose-300 font-bold">Low credits!</span> Click to buy more
              </>
            ) : (
              'Click to buy more credits'
            )}
            <Tooltip.Arrow className="fill-slate-800/95" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
