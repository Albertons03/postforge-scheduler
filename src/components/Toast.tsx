'use client';

import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Toast({ type, message }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-900',
      border: 'border-green-700',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      text: 'text-green-100',
    },
    error: {
      bg: 'bg-red-900',
      border: 'border-red-700',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      text: 'text-red-100',
    },
    info: {
      bg: 'bg-blue-900',
      border: 'border-blue-700',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      text: 'text-blue-100',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div
        className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-center space-x-3 shadow-lg max-w-sm`}
      >
        {style.icon}
        <p className={`text-sm font-medium flex-1 ${style.text}`}>{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-200 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
