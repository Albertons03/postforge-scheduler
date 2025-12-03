'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, TrendingUp, Calendar, Award } from 'lucide-react';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    creditsRemaining: 0,
    recentPosts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
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

  const quickStats = [
    {
      label: 'Credits',
      value: stats.creditsRemaining,
      icon: Zap,
      color: 'bg-indigo-600',
      gradient: 'from-indigo-600 to-indigo-800',
    },
    {
      label: 'Posts Created',
      value: stats.totalPosts,
      icon: TrendingUp,
      color: 'bg-purple-600',
      gradient: 'from-purple-600 to-purple-800',
    },
    {
      label: 'This Month',
      value: '8',
      icon: Calendar,
      color: 'bg-blue-600',
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      label: 'Achievements',
      value: '3',
      icon: Award,
      color: 'bg-emerald-600',
      gradient: 'from-emerald-600 to-emerald-800',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to create amazing content? Let's get started.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.gradient} rounded-lg border border-opacity-20 border-white p-6 text-white shadow-lg hover:shadow-xl transition`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-gray-100 text-sm font-medium opacity-90 mb-1">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Generate Post CTA */}
          <Link
            href="/dashboard/generate"
            className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg border border-indigo-400 p-8 text-white hover:shadow-2xl transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition">
              ✨
            </div>
            <h3 className="text-2xl font-bold mb-2">Generate Content</h3>
            <p className="text-indigo-100 mb-6">
              Create AI-powered posts for any platform
            </p>
            <div className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
              Start Creating →
            </div>
          </Link>

          {/* View History */}
          <Link
            href="/dashboard/history"
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg border border-purple-400 p-8 text-white hover:shadow-2xl transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition">
              📝
            </div>
            <h3 className="text-2xl font-bold mb-2">View History</h3>
            <p className="text-purple-100 mb-6">
              Browse all your generated posts
            </p>
            <div className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
              View Posts →
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/dashboard/analytics"
            className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg border border-cyan-400 p-8 text-white hover:shadow-2xl transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-2xl font-bold mb-2">Analytics</h3>
            <p className="text-cyan-100 mb-6">
              Track your content performance
            </p>
            <div className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition">
              View Analytics →
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 pb-4 border-b border-gray-700">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Choose Your Topic
                </h3>
                <p className="text-gray-400 text-sm">
                  Enter any topic or idea for your content
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 pb-4 border-b border-gray-700">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Select Your Settings
                </h3>
                <p className="text-gray-400 text-sm">
                  Pick your platform, tone, and desired length
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 pb-4 border-b border-gray-700">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Generate Content</h3>
                <p className="text-gray-400 text-sm">
                  Click generate and let AI create your post
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Edit & Share
                </h3>
                <p className="text-gray-400 text-sm">
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
