'use client';

import { Zap } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface CreditCostBadgeProps {
  cost: number;
  tooltipContent?: string;
  variant?: 'default' | 'inline' | 'compact';
  showIcon?: boolean;
}

export default function CreditCostBadge({
  cost,
  tooltipContent,
  variant = 'default',
  showIcon = true,
}: CreditCostBadgeProps) {
  const variantClasses = {
    default: {
      container: 'px-3 py-1.5',
      text: 'text-xs font-semibold',
      icon: 'w-3.5 h-3.5',
      spacing: 'space-x-1.5',
    },
    inline: {
      container: 'px-2.5 py-1',
      text: 'text-xs font-medium',
      icon: 'w-3 h-3',
      spacing: 'space-x-1',
    },
    compact: {
      container: 'px-2 py-0.5',
      text: 'text-[10px] font-bold uppercase tracking-wide',
      icon: 'w-2.5 h-2.5',
      spacing: 'space-x-1',
    },
  };

  const classes = variantClasses[variant];

  const badge = (
    <span
      className={`
        inline-flex items-center ${classes.spacing}
        ${classes.container}
        bg-gradient-to-r from-indigo-600/90 to-purple-600/90
        hover:from-indigo-600 hover:to-purple-600
        backdrop-blur-sm
        text-white ${classes.text}
        rounded-lg
        border border-indigo-500/30
        shadow-sm
        transition-all duration-200
        hover:shadow-md hover:shadow-indigo-500/20
        hover:scale-105
        cursor-help
      `}
      aria-label={`Costs ${cost} ${cost === 1 ? 'credit' : 'credits'}`}
      role="status"
    >
      {showIcon && (
        <Zap
          className={`${classes.icon} flex-shrink-0`}
          fill="currentColor"
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">
        {cost} {cost === 1 ? 'credit' : 'credits'}
      </span>
    </span>
  );

  if (!tooltipContent) {
    return badge;
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {badge}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            sideOffset={8}
            className="
              z-50
              max-w-xs
              px-4 py-3
              bg-slate-800/95 backdrop-blur-lg
              border border-slate-700/50
              text-gray-200 text-sm font-medium leading-relaxed
              rounded-lg
              shadow-xl shadow-black/20
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            "
          >
            {tooltipContent}
            <Tooltip.Arrow className="fill-slate-800/95" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
