'use client';

import React from 'react';
import { AlertTriangle, Download, X } from 'lucide-react';

interface BackupAlertBannerProps {
  onDownloadBackup: () => void;
  onDismiss: () => void;
  message?: string;
  reason?: 'never_backed_up' | 'many_changes' | 'stale_backup' | 'up_to_date';
  unbackedCount?: number;
}

export const BackupAlertBanner: React.FC<BackupAlertBannerProps> = ({
  onDownloadBackup,
  onDismiss,
  message,
  reason = 'many_changes',
  unbackedCount = 0,
}) => {
  const getBadgeLabel = () => {
    if (reason === 'never_backed_up') return 'Unsaved Vault';
    if (reason === 'many_changes') return `${unbackedCount} New Changes`;
    if (reason === 'stale_backup') return 'Stale Backup';
    return 'Action Needed';
  };

  const getTitle = () => {
    if (reason === 'never_backed_up') return 'First Backup Recommended';
    if (reason === 'many_changes') return 'Unbacked Changes Detected';
    if (reason === 'stale_backup') return 'Backup Update Recommended';
    return 'Data Backup Recommended';
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/25 px-4 py-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all animate-in fade-in duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs min-w-0">
          <span className="font-bold text-amber-900 dark:text-amber-200 shrink-0">
            {getTitle()}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 shrink-0">
            {getBadgeLabel()}
          </span>
          <span className="text-amber-800/80 dark:text-amber-300/80 truncate">
            {message || 'Export a snapshot to keep your local credentials safe.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <button
          onClick={onDownloadBackup}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Backup</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1 text-amber-700/60 hover:text-amber-900 dark:text-amber-400/60 dark:hover:text-amber-200 rounded-md hover:bg-amber-500/15 transition"
          title="Dismiss (Snooze 14 days)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
