'use client';

import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface SecurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            SiteVault Tips & Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              ⚡ Quick Clipboard Copy
            </p>
            <p>
              Click directly on any copy icon next to email or password fields to immediately copy it to your clipboard with toast feedback.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              ⌨️ Keyboard Navigation
            </p>
            <p>
              Press{' '}
              <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                Cmd + K
              </kbd>{' '}
              or{' '}
              <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                /
              </kbd>{' '}
              to jump straight into global search.
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              💾 Browser Sandbox Protection
            </p>
            <p>
              Your vault entries live in localStorage. Export a periodic JSON file to synchronize across team computers or browsers.
            </p>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
