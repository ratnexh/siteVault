'use client';

import React from 'react';
import { ViewMode, SortOption } from '@/types/site';
import { Search, X, LayoutGrid, List } from 'lucide-react';

interface FilterToolbarProps {
  filteredCount: number;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSetSortBy: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearSearch: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filteredCount,
  viewMode,
  onSetViewMode,
  sortBy,
  onSetSortBy,
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchInputRef,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>All Client Sites</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredCount} site{filteredCount === 1 ? '' : 's'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage URLs, CMS login credentials, design specs, and staging environments in one place.
          </p>
        </div>

        {/* Grid/Table View & Sort Dropdown */}
        <div className="flex items-center gap-2">
          {/* View Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => onSetViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSetSortBy(e.target.value as SortOption)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium py-2 pl-3 pr-8 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="recent">Recently Updated</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Site Name, 2.0 ID, 3.0 ID, or notes..."
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
