import { SiteEntry, ViewMode, SortOption } from '@/types/site';
import { DEFAULT_SITES } from './constants';

const STORAGE_KEY = 'sitevault_v2_data';
const LEGACY_STORAGE_KEY = 'sitevault_data';
const THEME_KEY = 'sitevault_theme';
const DISMISS_BANNER_KEY = 'sitevault_dismiss_backup';
const VIEW_MODE_KEY = 'sitevault_view_mode';
const SORT_KEY = 'sitevault_sort_by';

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

export function getSavedViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'grid' || saved === 'table') return saved;
  } catch (e) {
    // fallback
  }
  return 'grid';
}

export function setSavedViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch (e) {
    // ignore
  }
}

export function getSavedSortOption(): SortOption {
  if (typeof window === 'undefined') return 'recent';
  try {
    const saved = localStorage.getItem(SORT_KEY);
    if (saved === 'recent' || saved === 'name_asc' || saved === 'name_desc') {
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return 'recent';
}

export function setSavedSortOption(sort: SortOption): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SORT_KEY, sort);
  } catch (e) {
    // ignore
  }
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
    cyan: {
      bg: 'bg-cyan-600',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'hover:border-cyan-400/80',
      lightBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60'
    },
    teal: {
      bg: 'bg-teal-600',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'hover:border-teal-400/80',
      lightBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-400/80',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
    },
    green: {
      bg: 'bg-green-600',
      text: 'text-green-600 dark:text-green-400',
      border: 'hover:border-green-400/80',
      lightBg: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200/80 dark:border-green-800/60'
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-400/80',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
    },
    orange: {
      bg: 'bg-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'hover:border-orange-400/80',
      lightBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60'
    },
    rose: {
      bg: 'bg-rose-600',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-400/80',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
    },
    red: {
      bg: 'bg-red-600',
      text: 'text-red-600 dark:text-red-400',
      border: 'hover:border-red-400/80',
      lightBg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200/80 dark:border-red-800/60'
    },
    pink: {
      bg: 'bg-pink-600',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'hover:border-pink-400/80',
      lightBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/60'
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-400/80',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
    },
    violet: {
      bg: 'bg-violet-600',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'hover:border-violet-400/80',
      lightBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60'
    },
    slate: {
      bg: 'bg-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'hover:border-slate-400/80',
      lightBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  };

  if (color && themes[color]) {
    return themes[color];
  }

  // Support hex color
  if (color && color.startsWith('#')) {
    return {
      bg: '',
      text: 'text-white',
      border: 'hover:border-indigo-400/80',
      lightBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
    };
  }

  return themes.indigo;
}

export function getColorHex(color: string): string {
  const hexMap: Record<string, string> = {
    indigo: '#4f46e5',
    blue: '#2563eb',
    cyan: '#0891b2',
    teal: '#0d9488',
    emerald: '#059669',
    green: '#16a34a',
    amber: '#d97706',
    orange: '#ea580c',
    rose: '#e11d48',
    red: '#dc2626',
    pink: '#db2777',
    purple: '#9333ea',
    violet: '#7c3aed',
    slate: '#475569',
  };
  if (color && color.startsWith('#')) return color;
  return hexMap[color] || '#4f46e5';
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
