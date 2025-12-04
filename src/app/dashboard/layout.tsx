'use client';

import { useState, useEffect } from 'react';
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
import CreditDisplay from '@/components/credits/CreditDisplay';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const pathname = usePathname();

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/credits/summary');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCredits(data.data.currentBalance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchCredits();
  }, []);

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
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700/50 shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-600/10 dark:to-purple-600/10">
          <div className="flex items-center justify-between">
            <div
              className={`font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent ${
                !sidebarOpen && 'hidden'
              }`}
            >
              PostForge
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              ) : (
                <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
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
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-500/10 dark:hover:to-purple-500/10 hover:text-indigo-700 dark:hover:text-white hover:shadow-sm'
                }`}
                title={item.name}
              >
                <div className={`${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'} transition-colors`}>
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

        {/* Credit Display Section */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700/50">
          {!isLoadingCredits && (
            <CreditDisplay
              credits={credits}
              onClick={() => setShowCreditModal(true)}
              compact={!sidebarOpen}
            />
          )}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-800/50 dark:to-slate-800/30">
          <div className="flex items-center justify-center">
            <div className="p-2 rounded-full bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-500/30">
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
        {/* Top Bar - Mobile Only */}
        <header className="bg-white dark:bg-gradient-to-r dark:from-slate-900/80 dark:via-slate-800/80 dark:to-slate-900/80 border-b border-gray-200 dark:border-slate-700/50 h-16 flex items-center px-6 shadow-sm lg:hidden">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              PostForge AI
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              ) : (
                <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        currentBalance={credits}
      />
    </div>
  );
}
