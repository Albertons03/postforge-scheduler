'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2.5 rounded-xl
          bg-slate-50 dark:bg-slate-800/50
          border-2 border-slate-200 dark:border-slate-700/50
          hover:bg-slate-100 dark:hover:bg-slate-700/50
          hover:border-slate-300 dark:hover:border-slate-600/50
          transition-all duration-200
          hover:scale-110 active:scale-95
          group
          ${className}
        `}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300
                          group-hover:rotate-180 transition-all duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 group-hover:text-indigo-500
                           group-hover:rotate-12 transition-all duration-300" />
        )}
      </button>
    );
  }

  // Switch variant
  return (
    <div className={`
      flex items-center gap-2 p-1
      bg-slate-50 dark:bg-slate-800/50
      rounded-full border-2 border-slate-200 dark:border-slate-700/50
      ${className}
    `}>
      <button
        onClick={() => setTheme('light')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${resolvedTheme === 'light'
            ? 'bg-white dark:bg-slate-700 shadow-md'
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }
        `}
        aria-label="Switch to light mode"
        title="Light mode"
      >
        <Sun className={`w-4 h-4 ${
          resolvedTheme === 'light' ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
        }`} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${resolvedTheme === 'dark'
            ? 'bg-slate-700 shadow-md'
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }
        `}
        aria-label="Switch to dark mode"
        title="Dark mode"
      >
        <Moon className={`w-4 h-4 ${
          resolvedTheme === 'dark' ? 'text-indigo-400' : 'text-gray-400 dark:text-gray-500'
        }`} />
      </button>
    </div>
  );
}
