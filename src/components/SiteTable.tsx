'use client';

import React from 'react';
import { SiteEntry } from '@/types/site';
import { getThemeClasses } from '@/lib/storage';
import { Pencil, Trash2, ExternalLink, FileText, Figma as FigmaIcon } from 'lucide-react';

interface SiteTableProps {
  sites: SiteEntry[];
  onEdit: (site: SiteEntry) => void;
  onDelete: (siteId: string) => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({ sites, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Site Name</th>
              <th className="px-4 py-3.5">Version 2.0 URLs</th>
              <th className="px-4 py-3.5">Version 3.0 URLs</th>
              <th className="px-4 py-3.5">Credentials & Notes</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sites.map((site) => {
              const theme = getThemeClasses(site.color || 'indigo');
              const initial = site.name.trim().charAt(0).toUpperCase();

              return (
                <tr key={site.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${theme.bg} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}
                        style={site.color?.startsWith('#') ? { backgroundColor: site.color } : undefined}
                      >
                        {initial}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{site.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {site.id}</div>
                        {/* Quick Spec & Figma Links */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {site.docsUrl && (
                            <a
                              href={site.docsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 hover:underline"
                            >
                              <FileText className="w-2.5 h-2.5 text-sky-500" />
                              Docs
                            </a>
                          )}
                          {site.figmaUrl && (
                            <a
                              href={site.figmaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 hover:underline"
                            >
                              <FigmaIcon className="w-2.5 h-2.5 text-pink-500" />
                              Figma
                            </a>
                          )}
                          {(site.extraLinks || []).map((extra, i) => (
                            <a
                              key={extra.id || i}
                              href={extra.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border hover:underline max-w-[110px] truncate ${
                                extra.type === 'figma'
                                  ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60'
                                  : extra.type === 'doc'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60'
                              }`}
                              title={extra.title}
                            >
                              {extra.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      {site.v2?.liveUrl && (
                        <a href={site.v2.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                          2.0 Live Site <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {site.v2?.dashboardUrl && (
                        <a href={site.v2.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                          2.0 Dashboard <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {site.v2?.editUrl && (
                        <a href={site.v2.editUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                          2.0 Preview URL<ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {!site.v2?.liveUrl && !site.v2?.dashboardUrl && !site.v2?.editUrl && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      {site.v3?.liveUrl && (
                        <a href={site.v3.liveUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                          3.0 Live Site <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {site.v3?.dashboardUrl && (
                        <a href={site.v3.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                          3.0 Dashboard <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {site.v3?.editUrl && (
                        <a href={site.v3.editUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                          3.0 Edit CMS <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {!site.v3?.liveUrl && !site.v3?.dashboardUrl && !site.v3?.editUrl && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    <div className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{site.credentials?.email || '—'}</div>
                    <div className="text-slate-400 text-[10px] truncate max-w-[200px]">{site.credentials?.notes || ''}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(site)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(site.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
