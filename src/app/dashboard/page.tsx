'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, TrendingUp, Calendar, Award } from 'lucide-react';
import CreditOverview from '@/components/credits/CreditOverview';

interface DashboardStats {
  totalPosts: number;
  creditsRemaining: number;
  recentPosts: Array<{
    id: string;
    content: string;
    platform: string;
    createdAt: string;
  }>;
}

interface CreditSummary {
  currentBalance: number;
  totalPurchased: number;
  totalSpent: number;
  spentThisMonth: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    creditsRemaining: 0,
    recentPosts: [],
  });
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchCreditSummary();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Implement API endpoint for dashboard stats
      setStats({
        totalPosts: 12,
        creditsRemaining: 45,
        recentPosts: [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditSummary = async () => {
    try {
      const response = await fetch('/api/credits/summary');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCreditSummary({
            currentBalance: data.data.currentBalance,
            totalPurchased: data.data.totalPurchased,
            totalSpent: data.data.totalSpent,
            spentThisMonth: data.data.spentThisMonth,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch credit summary:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleBuyCredits = () => {
    // This will be handled by the CreditPurchaseModal in the layout
    // For now, we can navigate to a dedicated purchase page or trigger a modal
    router.push('/dashboard?showCreditModal=true');
  };

  const handleViewHistory = () => {
    router.push('/dashboard/credits/history');
  };

  const quickStats = [
    {
      label: 'Credits',
      value: stats.creditsRemaining,
      icon: Zap,
      color: 'bg-indigo-600',
      gradient: 'from-indigo-600 via-indigo-500 to-purple-600',
      iconColor: 'text-yellow-300',
      borderColor: 'border-indigo-400/30',
    },
    {
      label: 'Posts Created',
      value: stats.totalPosts,
      icon: TrendingUp,
      color: 'bg-purple-600',
      gradient: 'from-purple-600 via-purple-500 to-pink-600',
      iconColor: 'text-pink-300',
      borderColor: 'border-purple-400/30',
    },
    {
      label: 'This Month',
      value: '8',
      icon: Calendar,
      color: 'bg-blue-600',
      gradient: 'from-cyan-600 via-blue-500 to-blue-600',
      iconColor: 'text-cyan-300',
      borderColor: 'border-cyan-400/30',
    },
    {
      label: 'Achievements',
      value: '3',
      icon: Award,
      color: 'bg-emerald-600',
      gradient: 'from-emerald-600 via-teal-500 to-green-600',
      iconColor: 'text-amber-300',
      borderColor: 'border-emerald-400/30',
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 animate-gradient">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to create amazing content? Let's get started.
          </p>
        </div>

        {/* Credit Overview Section */}
        {!isLoadingCredits && creditSummary && (
          <div className="mb-10">
            <CreditOverview
              currentBalance={creditSummary.currentBalance}
              totalPurchased={creditSummary.totalPurchased}
              totalSpent={creditSummary.totalSpent}
              thisMonthUsage={creditSummary.spentThisMonth}
              onBuyCredits={handleBuyCredits}
              onViewHistory={handleViewHistory}
            />
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.gradient} rounded-2xl border-2 ${stat.borderColor} p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                  <p className="text-gray-100 text-sm font-semibold opacity-90 mb-2">
                    {stat.label}
                  </p>
                  <p className="text-5xl font-bold tracking-tight">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Generate Post CTA */}
          <Link
            href="/dashboard/generate"
            className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl border-2 border-indigo-400/40 p-8 text-white hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                ✨
              </div>
              <h3 className="text-2xl font-bold mb-2">Generate Content</h3>
              <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
                Create AI-powered posts for any platform
              </p>
              <div className="inline-flex items-center px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 font-semibold text-sm backdrop-blur-sm border border-white/20 group-hover:border-white/40">
                Start Creating →
              </div>
            </div>
          </Link>

          {/* View History */}
          <Link
            href="/dashboard/history"
            className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-2xl border-2 border-purple-400/40 p-8 text-white hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                📝
              </div>
              <h3 className="text-2xl font-bold mb-2">View History</h3>
              <p className="text-purple-100 mb-6 text-sm leading-relaxed">
                Browse all your generated posts
              </p>
              <div className="inline-flex items-center px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 font-semibold text-sm backdrop-blur-sm border border-white/20 group-hover:border-white/40">
                View Posts →
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/analytics"
            className="bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-600 rounded-2xl border-2 border-cyan-400/40 p-8 text-white hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-2">Analytics</h3>
              <p className="text-cyan-100 mb-6 text-sm leading-relaxed">
                Track your content performance
              </p>
              <div className="inline-flex items-center px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 font-semibold text-sm backdrop-blur-sm border border-white/20 group-hover:border-white/40">
                View Analytics →
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 p-8 shadow-xl">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-8">
            Getting Started
          </h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4 pb-6 border-b border-slate-700/50 group hover:border-indigo-500/50 transition-colors duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div>
                <h3 className="text-white font-bold mb-2 text-lg group-hover:text-indigo-300 transition-colors">
                  Choose Your Topic
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter any topic or idea for your content
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 pb-6 border-b border-slate-700/50 group hover:border-purple-500/50 transition-colors duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div>
                <h3 className="text-white font-bold mb-2 text-lg group-hover:text-purple-300 transition-colors">
                  Select Your Settings
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Pick your platform, tone, and desired length
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 pb-6 border-b border-slate-700/50 group hover:border-cyan-500/50 transition-colors duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div>
                <h3 className="text-white font-bold mb-2 text-lg group-hover:text-cyan-300 transition-colors">
                  Generate Content
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Click generate and let AI create your post
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <div>
                <h3 className="text-white font-bold mb-2 text-lg group-hover:text-emerald-300 transition-colors">
                  Edit & Share
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Customize the content and save or copy to clipboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
