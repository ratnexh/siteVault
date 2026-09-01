'use client';

import React from 'react';
import { AlertTriangle, Download, X } from 'lucide-react';

interface BackupAlertBannerProps {
  onDownloadBackup: () => void;
  onDismiss: () => void;
}

export const BackupAlertBanner: React.FC<BackupAlertBannerProps> = ({
  onDownloadBackup,
  onDismiss,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Data Backup Recommended
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Local Sandbox
            </span>
          </div>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
            SiteVault data is stored in your browser session. Export a JSON snapshot regularly to prevent accidental cache clears.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={onDownloadBackup}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Backup</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-amber-700/60 hover:text-amber-900 dark:text-amber-400/60 dark:hover:text-amber-200 rounded-lg hover:bg-amber-500/10 transition"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
