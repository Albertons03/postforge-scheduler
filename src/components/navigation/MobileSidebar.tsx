'use client';

import { Fragment } from 'react';
import { X, Home, PlusSquare, History, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import CreditDisplay from '@/components/credits/CreditDisplay';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onShowCreditModal: () => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate', href: '/dashboard/generate', icon: PlusSquare },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function MobileSidebar({
  isOpen,
  onClose,
  credits,
  onShowCreditModal,
}: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          w-[280px] max-w-[75vw]
          bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
          border-r border-gray-200 dark:border-slate-700/50
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-600/10 dark:to-purple-600/10">
          <div className="font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            PostForge
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 group relative overflow-hidden
                  min-h-[48px]
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gradient-to-r dark:hover:from-indigo-500/10 dark:hover:to-purple-500/10 hover:text-indigo-700 dark:hover:text-white hover:shadow-sm'
                  }
                `}
              >
                <div
                  className={`${
                    isActive
                      ? 'text-white'
                      : 'text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
                  } transition-colors`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </div>
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Credit Display */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700/50">
          <CreditDisplay
            credits={credits}
            onClick={onShowCreditModal}
            compact={false}
          />
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-800/50 dark:to-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                Your Account
              </p>
            </div>
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
    </>
  );
}
