'use client';

import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    {
      label: 'Total Posts Generated',
      value: '24',
      change: '+12%',
      icon: Zap,
      color: 'bg-indigo-600',
    },
    {
      label: 'Posts Scheduled',
      value: '8',
      change: '+5%',
      icon: BarChart3,
      color: 'bg-purple-600',
    },
    {
      label: 'Engagement Rate',
      value: '3.8%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'bg-green-600',
    },
    {
      label: 'Total Reach',
      value: '1.2K',
      change: '+8%',
      icon: Users,
      color: 'bg-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Analytics
          </h1>
          <p className="text-gray-400">Track your content performance and engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${stat.color} rounded-lg p-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-400">
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Posts by Platform */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Posts by Platform
            </h2>
            <div className="space-y-4">
              {[
                { platform: 'LinkedIn', posts: 12, color: 'bg-blue-500' },
                { platform: 'Twitter', posts: 8, color: 'bg-cyan-500' },
                { platform: 'Instagram', posts: 3, color: 'bg-pink-500' },
                { platform: 'Facebook', posts: 1, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{item.platform}</span>
                    <span className="font-medium text-white">{item.posts}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${(item.posts / 12) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Distribution */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Content Tone Distribution
            </h2>
            <div className="space-y-4">
              {[
                { tone: 'Professional', percentage: 45, color: 'bg-indigo-500' },
                { tone: 'Casual', percentage: 30, color: 'bg-emerald-500' },
                { tone: 'Inspirational', percentage: 15, color: 'bg-yellow-500' },
                { tone: 'Humorous', percentage: 10, color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.tone}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{item.tone}</span>
                    <span className="font-medium text-white">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              { action: 'Post generated', platform: 'LinkedIn', time: '2 hours ago' },
              { action: 'Post scheduled', platform: 'Twitter', time: '5 hours ago' },
              { action: 'Post generated', platform: 'Instagram', time: '1 day ago' },
              { action: 'Post saved', platform: 'Facebook', time: '2 days ago' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{item.action}</p>
                  <p className="text-sm text-gray-400">{item.platform}</p>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
