'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

interface ConfirmModalProps {
  config: ConfirmDialogState;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ config, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!config.isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isOpen, onClose]);

  if (!config.isOpen) return null;

  const isDanger = config.variant !== 'primary' && config.variant !== 'warning';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-6"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isDanger
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
            }`}
          >
            {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {config.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {config.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {config.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              config.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20'
            }`}
          >
            {config.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
