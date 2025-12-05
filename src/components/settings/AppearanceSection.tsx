'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, CheckCircle } from 'lucide-react';

export function AppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light theme with bright colors',
      preview: 'bg-white border-slate-200',
      iconColor: 'text-amber-500',
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme with muted colors',
      preview: 'bg-slate-900 border-slate-700',
      iconColor: 'text-indigo-400',
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Adapts to your system preference',
      preview: 'bg-gradient-to-r from-white to-slate-900 border-slate-400',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Appearance
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize how PostForge AI looks on your device
        </p>
      </div>

      {/* Theme Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Theme
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`
                  flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                  hover:scale-105 active:scale-95
                  ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                  }
                `}
                aria-label={`Switch to ${option.label} theme`}
              >
                {/* Preview Box */}
                <div
                  className={`w-full h-20 rounded-lg ${option.preview} border-2 flex items-center justify-center transition-all duration-200`}
                >
                  <Icon className={`w-8 h-8 ${option.iconColor}`} />
                </div>

                {/* Label */}
                <div className="text-center space-y-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            {resolvedTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {theme === 'system'
                ? 'Following your system preference'
                : `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme selected`}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Theme Preference
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your theme preference is saved and will be applied across all devices where you're signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
