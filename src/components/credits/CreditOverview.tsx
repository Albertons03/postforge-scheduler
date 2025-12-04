'use client';

import React from 'react';
import { Zap, TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';

interface CreditOverviewProps {
  currentBalance: number;
  totalPurchased: number;
  totalSpent: number;
  thisMonthUsage: number;
  onBuyCredits: () => void;
  onViewHistory: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradientFrom: string;
  gradientTo: string;
  iconBgGradient: string;
  hoverBorderGradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  gradientFrom,
  gradientTo,
  iconBgGradient,
  hoverBorderGradient,
}) => {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/50"
      role="article"
      aria-label={`${label}: ${value}`}
    >
      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
        aria-hidden="true"
      />

      {/* Hover border glow */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${hoverBorderGradient} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon badge */}
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${iconBgGradient} shadow-lg`}
          aria-hidden="true"
        >
          <div className="text-white">{icon}</div>
        </div>

        {/* Label */}
        <p className="mb-2 text-sm font-medium text-gray-400">{label}</p>

        {/* Value */}
        <p className="text-3xl font-bold text-white">
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
}) => {
  // Determine balance color based on credit level
  const getBalanceGradient = () => {
    if (currentBalance > 20) {
      return {
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-green-600',
        iconBgGradient: 'from-emerald-500 to-green-500',
        hoverBorderGradient: 'from-emerald-500 to-green-500',
      };
    } else if (currentBalance >= 5) {
      return {
        gradientFrom: 'from-amber-600',
        gradientTo: 'to-yellow-600',
        iconBgGradient: 'from-amber-500 to-yellow-500',
        hoverBorderGradient: 'from-amber-500 to-yellow-500',
      };
    } else {
      return {
        gradientFrom: 'from-rose-600',
        gradientTo: 'to-red-600',
        iconBgGradient: 'from-rose-500 to-red-500',
        hoverBorderGradient: 'from-rose-500 to-red-500',
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

        {/* Stats grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Current Balance */}
            <StatCard
              icon={<Zap className="h-6 w-6" fill="currentColor" />}
              label="Current Balance"
              value={currentBalance}
              gradientFrom={balanceColors.gradientFrom}
              gradientTo={balanceColors.gradientTo}
              iconBgGradient={balanceColors.iconBgGradient}
              hoverBorderGradient={balanceColors.hoverBorderGradient}
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
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-gray-800 bg-gray-900/30 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onBuyCredits}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
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
              className="group flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 font-semibold text-gray-300 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950"
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
