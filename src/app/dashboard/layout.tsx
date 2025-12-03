'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  Menu,
  X,
  BarChart3,
  PlusSquare,
  History,
  Settings,
  Home,
  ChevronRight,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard',
    },
    {
      name: 'Generate',
      href: '/dashboard/generate',
      icon: PlusSquare,
      isActive: pathname === '/dashboard/generate',
    },
    {
      name: 'History',
      href: '/dashboard/history',
      icon: History,
      isActive: pathname === '/dashboard/history',
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      isActive: pathname === '/dashboard/analytics',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      isActive: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl transition-all duration-300 flex flex-col backdrop-blur-xl`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div
              className={`font-bold text-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${
                !sidebarOpen && 'hidden'
              }`}
            >
              PostForge
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-indigo-500/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-indigo-500/30"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-indigo-300" />
              ) : (
                <Menu className="w-5 h-5 text-indigo-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-white hover:scale-105 hover:shadow-md'
                }`}
                title={item.name}
              >
                <div className={`${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'} transition-colors`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </div>
                <span
                  className={`font-semibold text-sm ${
                    !sidebarOpen && 'hidden'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <div className="flex items-center justify-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 h-16 flex items-center px-6 shadow-lg">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              PostForge AI
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-indigo-500/20 rounded-xl lg:hidden transition-all duration-200 hover:scale-110 border border-transparent hover:border-indigo-500/30"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-indigo-300" />
              ) : (
                <Menu className="w-5 h-5 text-indigo-300" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
