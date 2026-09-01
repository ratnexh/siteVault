'use client';

import React from 'react';
import { SiteEntry } from '@/types/site';
import { getThemeClasses } from '@/lib/storage';
import { LayoutGrid, FileText, Figma, Shield, ChevronRight } from 'lucide-react';

interface SidebarProps {
  sites: SiteEntry[];
  activeFilterTag: string;
  totalCount: number;
  storageSizeText: string;
  onFilterTag: (tag: string) => void;
  onQuickSiteClick: (siteName: string) => void;
  onShowVaultTips: () => void;
  isOpenMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sites,
  activeFilterTag,
  totalCount,
  storageSizeText,
  onFilterTag,
  onQuickSiteClick,
  onShowVaultTips,
  isOpenMobile = false,
}) => {
  return (
    <aside className={`w-64 shrink-0 flex-col gap-6 select-none ${isOpenMobile ? 'flex' : 'hidden lg:flex'}`}>
      
      {/* Quick Filter / Section Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Navigation</span>
          <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {totalCount}
          </span>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onFilterTag('all')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition ${
              activeFilterTag === 'all'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>All Websites</span>
            </span>
            <span className="text-[11px] bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded-full font-mono">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => onFilterTag('Docs')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition ${
              activeFilterTag === 'Docs'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>With Specs & Docs</span>
            </span>
          </button>

          <button
            onClick={() => onFilterTag('Figma')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition ${
              activeFilterTag === 'Figma'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Figma className="w-4 h-4 text-pink-500" />
              <span>With Figma Files</span>
            </span>
          </button>
        </nav>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Sites
            </span>
          </div>
          
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {sites.map((site) => {
              const theme = getThemeClasses(site.color || 'indigo');
              return (
                <button
                  key={site.id}
                  onClick={() => onQuickSiteClick(site.name)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group text-left"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 rounded-md ${theme.bg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                      {site.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{site.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security Vault Info Box */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg border border-indigo-700/30">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide">Client Vault Protocol</h3>
        </div>
        <p className="text-[11px] text-indigo-200/80 leading-relaxed mb-3">
          All API keys, staging URLs and credentials are encrypted and stored in local sandbox memory.
        </p>
        <button
          onClick={onShowVaultTips}
          className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition"
        >
          <span>Security & Tips Guide</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Storage Indicator */}
      <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Storage Engine</span>
        </span>
        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
          {storageSizeText}
        </span>
      </div>

    </aside>
  );
};
