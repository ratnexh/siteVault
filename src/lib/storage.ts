import { SiteEntry } from '@/types/site';
import { DEFAULT_SITES } from './constants';

const STORAGE_KEY = 'sitevault_v2_data';
const LEGACY_STORAGE_KEY = 'sitevault_data';
const THEME_KEY = 'sitevault_theme';
const DISMISS_BANNER_KEY = 'sitevault_dismiss_backup';

export function loadSavedSites(): SiteEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    // Purge legacy sample data cache if present
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveSitesToStorage(sites: SiteEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function getVaultStorageSizeKB(sites: SiteEntry[]): string {
  if (!sites || sites.length === 0) return '0.0 KB Cached';
  try {
    const bytes = typeof Blob !== 'undefined' ? new Blob([JSON.stringify(sites)]).size : 0;
    return `${(bytes / 1024).toFixed(1)} KB Cached`;
  } catch (e) {
    return 'Local JSON';
  }
}

export function getSavedTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setSavedTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function isBackupBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DISMISS_BANNER_KEY) === 'true';
}

export function setBackupBannerDismissed(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DISMISS_BANNER_KEY, 'true');
}

export function exportVaultJSON(sites: SiteEntry[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sites, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `SiteVault_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'recently';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getThemeClasses(color: string) {
  const themes: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    indigo: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-400/80',
      lightBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
    },
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-400/80',
      lightBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-400/80',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-400/80',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
    },
    rose: {
      bg: 'bg-rose-600',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-400/80',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-400/80',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
    }
  };
  return themes[color] || themes.indigo;
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    'Live': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    'Staging': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    'Amends': 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    'Maintenance': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
  };
  return map[status] || map['Live'];
}
