'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  ChevronDown
} from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';

interface HeaderProps {
  activeCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAddModal: () => void;
  onFocusSearch: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDefault: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenAddModal,
  onFocusSearch,
  onExportJSON,
  onImportJSON,
  onResetDefault,
  onToggleMobileSidebar,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Left Tools */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <SiteLogo activeCount={activeCount} />

          <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Local Vault Sync: Protected</span>
            </div>
          </div>
        </div>

        {/* Center Search & Right CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Command Hint Button */}
          <button 
            onClick={onFocusSearch}
            className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Quick Jump</span>
            <kbd className="font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Export / Import Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-2.5 sm:px-3 py-2 rounded-lg shadow-sm transition"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Backup & Sync</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onExportJSON();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition"
                >
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Export JSON Backup</span>
                </button>
                <label className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Import JSON File</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      onImportJSON(e);
                      setDropdownOpen(false);
                    }}
                  />
                </label>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    onResetDefault();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear All Vault Data</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Add Site Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-[0.98] text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition shrink-0"
            title="Add new site vault entry"
          >
            <Plus className="w-4 h-4" />
            <span>Add Site</span>
          </button>
        </div>

      </div>
    </header>
  );
};
