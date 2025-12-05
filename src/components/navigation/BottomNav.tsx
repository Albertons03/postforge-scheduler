'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, PlusSquare, History, Settings } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/generate', icon: PlusSquare, label: 'Generate' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40
                 bg-white dark:bg-slate-900/95 backdrop-blur-md
                 border-t border-gray-200 dark:border-slate-700/50
                 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
                 lg:hidden"
      role="navigation"
      aria-label="Bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
                          (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-1 flex-col items-center justify-center gap-1
                transition-all duration-200
                min-h-[48px]
                ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400 font-semibold border-t-2 border-indigo-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800/50'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
