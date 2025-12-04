'use client';

import React from 'react';
import { Zap, TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { SkeletonStatCard } from '@/components/ui/SkeletonStatCard';

interface CreditOverviewProps {
  currentBalance: number;
  totalPurchased: number;
  totalSpent: number;
  thisMonthUsage: number;
  onBuyCredits: () => void;
  onViewHistory: () => void;
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradientFrom: string;
  gradientTo: string;
  iconBgGradient: string;
  hoverBorderGradient: string;
  glowColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'cyan';
  variant?: 'default' | 'hero';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  gradientFrom,
  gradientTo,
  iconBgGradient,
  hoverBorderGradient,
  glowColor = 'indigo',
  variant = 'default',
}) => {
  const isHero = variant === 'hero';

  // Map glow colors to Tailwind shadow classes
  const glowShadows = {
    emerald: 'group-hover:shadow-glow-emerald-lg',
    amber: 'group-hover:shadow-glow-amber-lg',
    rose: 'group-hover:shadow-glow-rose-lg',
    indigo: 'group-hover:shadow-glow-indigo-lg',
    purple: 'group-hover:shadow-glow-purple-lg',
    cyan: 'group-hover:shadow-glow-cyan-lg',
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border bg-gray-900/50
        transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.02]
        ${isHero
          ? 'border-gray-700 p-8 shadow-card-lg md:p-10'
          : 'border-gray-800 p-4 shadow-card-md sm:p-6'
        }
        ${glowShadows[glowColor]}
      `}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      {/* Hover gradient overlay - enhanced opacity for hero */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}
          opacity-0 transition-opacity duration-300
          ${isHero ? 'group-hover:opacity-10' : 'group-hover:opacity-5'}
        `}
        aria-hidden="true"
      />

      {/* Hover border glow - enhanced for colored cards */}
      <div
        className={`
          absolute inset-0 rounded-xl bg-gradient-to-br ${hoverBorderGradient}
          opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30
        `}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon badge - larger for hero variant */}
        <div
          className={`
            mb-4 inline-flex items-center justify-center rounded-lg
            bg-gradient-to-br ${iconBgGradient} shadow-lg
            transition-transform duration-300 group-hover:scale-110
            ${isHero ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12'}
          `}
          aria-hidden="true"
        >
          <div className={`text-white ${isHero ? 'scale-125 md:scale-150' : ''}`}>
            {icon}
          </div>
        </div>

        {/* Label - responsive sizing */}
        <p
          className={`
            mb-2 font-medium text-gray-400
            ${isHero ? 'text-base md:text-lg' : 'text-sm'}
          `}
        >
          {label}
        </p>

        {/* Value - larger for hero with responsive sizing */}
        <p
          className={`
            font-bold text-white
            ${isHero ? 'text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'}
          `}
        >
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export const CreditOverview: React.FC<CreditOverviewProps> = ({
  currentBalance,
  totalPurchased,
  totalSpent,
  thisMonthUsage,
  onBuyCredits,
  onViewHistory,
  isLoading = false,
}) => {
  // Determine balance color based on credit level with glow color
  const getBalanceGradient = () => {
    if (currentBalance > 20) {
      return {
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-green-600',
        iconBgGradient: 'from-emerald-500 to-green-500',
        hoverBorderGradient: 'from-emerald-500 to-green-500',
        glowColor: 'emerald' as const,
      };
    } else if (currentBalance >= 5) {
      return {
        gradientFrom: 'from-amber-600',
        gradientTo: 'to-yellow-600',
        iconBgGradient: 'from-amber-500 to-yellow-500',
        hoverBorderGradient: 'from-amber-500 to-yellow-500',
        glowColor: 'amber' as const,
      };
    } else {
      return {
        gradientFrom: 'from-rose-600',
        gradientTo: 'to-red-600',
        iconBgGradient: 'from-rose-500 to-red-500',
        hoverBorderGradient: 'from-rose-500 to-red-500',
        glowColor: 'rose' as const,
      };
    }
  };

  const balanceColors = getBalanceGradient();
  const showLowCreditWarning = currentBalance < 5;

  return (
    <div className="space-y-6">
      {/* Low credit warning banner */}
      {showLowCreditWarning && (
        <div
          className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
            <AlertTriangle className="h-5 w-5 text-rose-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Low Credit Balance</p>
            <p className="text-sm text-rose-300/80">
              You have {currentBalance} {currentBalance === 1 ? 'credit' : 'credits'} remaining. Consider purchasing more to continue using PostForge.
            </p>
          </div>
          <button
            onClick={onBuyCredits}
            className="shrink-0 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            aria-label="Buy more credits now"
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Main credit overview card */}
      <div
        className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 shadow-2xl"
        role="region"
        aria-label="Credit statistics overview"
      >
        {/* Header */}
        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-xl font-bold text-white">Credit Overview</h2>
          <p className="mt-1 text-sm text-gray-400">
            Monitor your credit usage and balance
          </p>
        </div>

        {/* Stats grid with responsive improvements */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            // Loading skeleton state
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SkeletonStatCard variant="hero" />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : (
            // Actual data with hero variant for current balance
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Current Balance - HERO VARIANT with dynamic color */}
              <StatCard
                icon={<Zap className="h-6 w-6" fill="currentColor" />}
                label="Current Balance"
                value={currentBalance}
                gradientFrom={balanceColors.gradientFrom}
                gradientTo={balanceColors.gradientTo}
                iconBgGradient={balanceColors.iconBgGradient}
                hoverBorderGradient={balanceColors.hoverBorderGradient}
                glowColor={balanceColors.glowColor}
                variant="hero"
              />

              {/* Total Purchased */}
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Total Purchased"
                value={totalPurchased}
                gradientFrom="from-indigo-600"
                gradientTo="to-purple-600"
                iconBgGradient="from-indigo-500 to-purple-500"
                hoverBorderGradient="from-indigo-500 to-purple-500"
                glowColor="indigo"
              />

              {/* Total Spent */}
              <StatCard
                icon={<TrendingDown className="h-6 w-6" />}
                label="Total Spent"
                value={totalSpent}
                gradientFrom="from-purple-600"
                gradientTo="to-pink-600"
                iconBgGradient="from-purple-500 to-pink-500"
                hoverBorderGradient="from-purple-500 to-pink-500"
                glowColor="purple"
              />

              {/* This Month Usage */}
              <StatCard
                icon={<Calendar className="h-6 w-6" />}
                label="This Month"
                value={thisMonthUsage}
                gradientFrom="from-cyan-600"
                gradientTo="to-blue-600"
                iconBgGradient="from-cyan-500 to-blue-500"
                hoverBorderGradient="from-cyan-500 to-blue-500"
                glowColor="cyan"
              />
            </div>
          )}
        </div>

        {/* Action bar - improved touch targets and responsive padding */}
        <div className="border-t border-gray-800 bg-gray-900/30 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onBuyCredits}
              disabled={isLoading}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 min-h-[48px] sm:min-h-[44px]"
              aria-label="Purchase more credits"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" fill="currentColor" aria-hidden="true" />
                Buy More Credits
              </span>
              {/* Button hover effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>

            <button
              onClick={onViewHistory}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 font-semibold text-gray-300 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] sm:min-h-[44px]"
              aria-label="View credit transaction history"
            >
              <TrendingUp className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditOverview;
