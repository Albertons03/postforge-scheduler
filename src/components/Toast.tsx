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
      bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      border: 'border-emerald-400/50',
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      text: 'text-white',
      shadow: 'shadow-emerald-500/30',
    },
    error: {
      bg: 'bg-gradient-to-r from-rose-600 to-red-600',
      border: 'border-rose-400/50',
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      text: 'text-white',
      shadow: 'shadow-rose-500/30',
    },
    info: {
      bg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      border: 'border-cyan-400/50',
      icon: <Info className="w-6 h-6 text-white" />,
      text: 'text-white',
      shadow: 'shadow-cyan-500/30',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`${style.bg} border-2 ${style.border} rounded-2xl p-5 flex items-center space-x-4 shadow-2xl ${style.shadow} max-w-md backdrop-blur-xl`}
      >
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">
          {style.icon}
        </div>
        <p className={`text-sm font-semibold flex-1 ${style.text} leading-relaxed`}>{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
