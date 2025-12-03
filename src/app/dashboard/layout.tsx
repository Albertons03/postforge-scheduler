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
    <div className="flex h-screen bg-gray-900 text-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div
              className={`font-bold text-lg text-indigo-400 ${
                !sidebarOpen && 'hidden'
              }`}
            >
              PostForge
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={`font-medium text-sm ${
                    !sidebarOpen && 'hidden'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-white hidden sm:block">
              PostForge AI
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg lg:hidden transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="bg-gray-900 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
