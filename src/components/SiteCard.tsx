'use client';

import React from 'react';
import { SiteEntry } from '@/types/site';
import { getThemeClasses, getStatusBadge, formatRelativeTime } from '@/lib/storage';
import {
  FileText,
  Figma as FigmaIcon,
  Tag,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Edit3,
  Globe
} from 'lucide-react';

interface SiteCardProps {
  site: SiteEntry;
  isPasswordRevealed: boolean;
  onTogglePassword: (siteId: string) => void;
  onEdit: (site: SiteEntry) => void;
  onDelete: (siteId: string) => void;
  onCopy: (text: string, msg: string) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  isPasswordRevealed,
  onTogglePassword,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const theme = getThemeClasses(site.color || 'indigo');
  const initial = site.name.trim().charAt(0).toUpperCase();

  const passDisplay = site.credentials?.password
    ? isPasswordRevealed
      ? site.credentials.password
      : '••••••••••••'
    : 'None saved';

  return (
    <div className={`site-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${theme.border}`}>
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${theme.bg} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}>
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={site.name}>
                {site.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadge(site.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${site.status === 'Live' ? 'bg-emerald-500' : site.status === 'Staging' ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
                  {site.status || 'Active'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Updated {formatRelativeTime(site.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(site)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Edit Site Details"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(site.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Delete Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags & Spec Links Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {site.docsUrl && (
            <a
              href={site.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 hover:bg-sky-100 transition"
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              <span>Docs</span>
            </a>
          )}

          {site.figmaUrl ? (
            <a
              href={site.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800/60 hover:bg-pink-100 transition"
            >
              <FigmaIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Figma</span>
            </a>
          ) : site.noFigma ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              <span>No Figma</span>
            </span>
          ) : null}

          {(site.tags || [])
            .filter((t) => t !== 'Docs' && t !== 'Figma')
            .map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50"
              >
                <Tag className="w-3 h-3 mr-1 text-purple-400" />
                {t}
              </span>
            ))}
        </div>

        {/* Environments & Endpoints Section */}
        <div className="space-y-2 mb-4">
          {/* Version 2.0 */}
          {(site.v2?.dashboardUrl || site.v2?.editUrl || site.v2?.liveUrl) && (
            <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 font-mono">
                  v2.0 Environment
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {site.v2.liveUrl && (
                  <a
                    href={site.v2.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition group"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>2.0 Live Site</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {site.v2.dashboardUrl && (
                  <a
                    href={site.v2.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition group"
                  >
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    <span>2.0 Dashboard</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {site.v2.editUrl && (
                  <a
                    href={site.v2.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:hover:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>2.0 Preview URL</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Version 3.0 */}
          {(site.v3?.dashboardUrl || site.v3?.editUrl || site.v3?.liveUrl) && (
            <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                  v3.0 Next-Gen
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {site.v3.liveUrl && (
                  <a
                    href={site.v3.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition group"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>3.0 Live Site</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {site.v3.dashboardUrl && (
                  <a
                    href={site.v3.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition group"
                  >
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    <span>3.0 Dashboard URL</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {site.v3.editUrl && (
                  <a
                    href={site.v3.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:hover:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>3.0 Edit URL</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vault Credentials & Notes Box */}
        <div className="bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans font-bold">
            <span>Vault Secrets & Credentials</span>
            <button
              onClick={() => onTogglePassword(site.id)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 lowercase text-xs font-medium"
            >
              {isPasswordRevealed ? (
                <>
                  <EyeOff className="w-3 h-3" /> Hide secret
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> Reveal secret
                </>
              )}
            </button>
          </div>

          {site.credentials?.email && (
            <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-300">
              <span className="truncate" title={site.credentials.email}>
                {site.credentials.email}
              </span>
              <button
                onClick={() => onCopy(site.credentials.email, 'Email copied!')}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {site.credentials?.password && (
            <div className="flex items-center justify-between gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <span className="truncate">{passDisplay}</span>
              <button
                onClick={() => onCopy(site.credentials.password!, 'Password copied!')}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title="Copy Password"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {site.credentials?.notes ? (
            <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 italic">
              {site.credentials.notes}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">No extra notes</div>
          )}
        </div>

      </div>
    </div>
  );
};
