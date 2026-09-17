'use client';

import React from 'react';
import { SiteEntry } from '@/types/site';
import { getThemeClasses } from '@/lib/storage';
import { Shield, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  sites: SiteEntry[];
  totalCount: number;
  storageSizeText: string;
  onQuickSiteClick: (siteName: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sites,
  totalCount,
  storageSizeText,
  onQuickSiteClick,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:p-0 lg:bg-transparent lg:shadow-none lg:overflow-visible flex flex-col gap-5 select-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header Bar in Sidebar */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">SiteVault Navigation</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
        {/* Quick Sites Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Quick Sites</span>
            <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {totalCount}
            </span>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
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
            {sites.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">No sites in vault yet.</p>
            )}
          </div>
        </div>

        {/* Storage Indicator */}
        <div className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400 shadow-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Storage Engine</span>
          </span>
          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
            {storageSizeText}
          </span>
        </div>

      </aside>
    </>
  );
};
