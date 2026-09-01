'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SiteEntry, ViewMode, SortOption, ToastMessage } from '@/types/site';
import { DEFAULT_SITES } from '@/lib/constants';
import { 
  loadSavedSites, 
  saveSitesToStorage, 
  getVaultStorageSizeKB, 
  getSavedTheme, 
  setSavedTheme, 
  isBackupBannerDismissed, 
  setBackupBannerDismissed, 
  exportVaultJSON 
} from '@/lib/storage';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { BackupAlertBanner } from '@/components/BackupAlertBanner';
import { FilterToolbar } from '@/components/FilterToolbar';
import { SiteCard } from '@/components/SiteCard';
import { SiteTable } from '@/components/SiteTable';
import { SiteModal } from '@/components/SiteModal';
import { SecurityGuideModal } from '@/components/SecurityGuideModal';
import { Toast } from '@/components/Toast';
import { ShieldAlert, Plus, RotateCcw } from 'lucide-react';

export default function Home() {
  const [sites, setSites] = useState<SiteEntry[]>(DEFAULT_SITES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBackupBanner, setShowBackupBanner] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters & State
  const [activeTag, setActiveTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals & UI State
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [isSiteModalOpen, setIsSiteModalOpen] = useState<boolean>(false);
  const [editingSite, setEditingSite] = useState<SiteEntry | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Boot & initial load
  useEffect(() => {
    const loadedSites = loadSavedSites();
    setSites(loadedSites);

    const theme = getSavedTheme();
    setIsDarkMode(theme === 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (isBackupBannerDismissed()) {
      setShowBackupBanner(false);
    }

    setIsLoaded(true);
  }, []);

  // Sync to storage on state change
  useEffect(() => {
    if (isLoaded) {
      saveSitesToStorage(sites);
    }
  }, [sites, isLoaded]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, text, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Theme Toggle
  const handleToggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setSavedTheme(newTheme);
  };

  // Password reveal toggle
  const handleTogglePassword = (siteId: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  // Copy to clipboard
  const handleCopy = (text: string, message: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => showToast(message, 'success'),
      () => showToast('Failed to copy', 'error')
    );
  };

  // Export JSON
  const handleExportJSON = () => {
    exportVaultJSON(sites);
    showToast('Vault backup JSON downloaded', 'success');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setSites(imported);
          showToast(`Imported ${imported.length} sites successfully!`, 'success');
        } else {
          showToast('Invalid backup format', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm('Reset vault back to standard sample data?')) {
      setSites([...DEFAULT_SITES]);
      showToast('Restored default 4 sample sites', 'info');
    }
  };

  // Dismiss Banner
  const handleDismissBanner = () => {
    setShowBackupBanner(false);
    setBackupBannerDismissed();
    showToast('Backup notice dismissed for this session', 'info');
  };

  // Save Site (Add / Edit)
  const handleSaveSite = (siteData: Omit<SiteEntry, 'id' | 'updatedAt'> & { id?: string }) => {
    const nowIso = new Date().toISOString();
    if (siteData.id) {
      // Edit
      setSites((prev) =>
        prev.map((s) => (s.id === siteData.id ? ({ ...s, ...siteData, updatedAt: nowIso } as SiteEntry) : s))
      );
      showToast('Site entry updated successfully', 'success');
    } else {
      // Create new
      const newEntry: SiteEntry = {
        ...siteData,
        id: `site_${Date.now()}`,
        updatedAt: nowIso,
      };
      setSites((prev) => [newEntry, ...prev]);
      showToast('New site entry added to vault', 'success');
    }
    setIsSiteModalOpen(false);
    setEditingSite(null);
  };

  // Delete Site
  const handleDeleteSite = (siteId: string) => {
    const target = sites.find((s) => s.id === siteId);
    if (!target) return;
    if (window.confirm(`Are you sure you want to remove "${target.name}" from your vault?`)) {
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      showToast('Site entry removed', 'info');
    }
  };

  // Filtered & Sorted Sites
  const filteredAndSortedSites = useMemo(() => {
    let result = sites.filter((site) => {
      // Tag Filter
      if (activeTag !== 'all') {
        const hasTag = site.tags && site.tags.some((t) => t.toLowerCase().includes(activeTag.toLowerCase()));
        if (!hasTag) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatch = site.name.toLowerCase().includes(q);
        const notesMatch = site.credentials?.notes?.toLowerCase().includes(q) || false;
        const emailMatch = site.credentials?.email?.toLowerCase().includes(q) || false;
        const v2Match = `${site.v2?.dashboardUrl || ''}${site.v2?.editUrl || ''}`.toLowerCase().includes(q);
        const v3Match = `${site.v3?.dashboardUrl || ''}${site.v3?.editUrl || ''}`.toLowerCase().includes(q);
        return nameMatch || notesMatch || emailMatch || v2Match || v3Match;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'status') {
      result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    }

    return result;
  }, [sites, activeTag, searchQuery, sortBy]);

  const storageSizeText = useMemo(() => getVaultStorageSizeKB(sites), [sites]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeCount={sites.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAddModal={() => {
          setEditingSite(null);
          setIsSiteModalOpen(true);
        }}
        onFocusSearch={() => searchInputRef.current?.focus()}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onResetDefault={handleResetDefault}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Layout */}
      <div className="max-w-[1720px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-8">
        
        <Sidebar
          sites={sites}
          activeFilterTag={activeTag}
          totalCount={sites.length}
          storageSizeText={storageSizeText}
          onFilterTag={(tag) => setActiveTag(tag)}
          onQuickSiteClick={(name) => {
            setSearchQuery(name);
            searchInputRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          onShowVaultTips={() => setIsGuideModalOpen(true)}
          isOpenMobile={mobileSidebarOpen}
        />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          
          {showBackupBanner && (
            <BackupAlertBanner
              onDownloadBackup={handleExportJSON}
              onDismiss={handleDismissBanner}
            />
          )}

          <FilterToolbar
            filteredCount={filteredAndSortedSites.length}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            sortBy={sortBy}
            onSetSortBy={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => {
              setSearchQuery('');
              setActiveTag('all');
            }}
            activeTag={activeTag}
            onSetTag={setActiveTag}
            searchInputRef={searchInputRef}
          />

          {/* Cards or Table */}
          {filteredAndSortedSites.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Sites Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
                No site entries match your current search keywords or filters. Clear the search or create a new entry.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTag('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
                <button
                  onClick={() => {
                    setEditingSite(null);
                    setIsSiteModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Site</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredAndSortedSites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  isPasswordRevealed={revealedPasswords.has(site.id)}
                  onTogglePassword={handleTogglePassword}
                  onEdit={(s) => {
                    setEditingSite(s);
                    setIsSiteModalOpen(true);
                  }}
                  onDelete={handleDeleteSite}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          ) : (
            <SiteTable
              sites={filteredAndSortedSites}
              onEdit={(s) => {
                setEditingSite(s);
                setIsSiteModalOpen(true);
              }}
              onDelete={handleDeleteSite}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      <SiteModal
        isOpen={isSiteModalOpen}
        editingSite={editingSite}
        onClose={() => {
          setIsSiteModalOpen(false);
          setEditingSite(null);
        }}
        onSave={handleSaveSite}
      />

      <SecurityGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
