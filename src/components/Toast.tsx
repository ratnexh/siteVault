'use client';

import React from 'react';
import { ToastMessage } from '@/types/site';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xl border border-slate-800 dark:border-slate-200 pointer-events-auto transition duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
