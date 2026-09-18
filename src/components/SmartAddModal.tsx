'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SiteEntry, SiteColor, SiteStatus } from '@/types/site';
import { 
  parseSmartLinkDump, 
  DetectedSiteData 
} from '@/lib/smartDetector';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Globe, 
  ExternalLink, 
  KeyRound, 
  FileText, 
  Figma, 
  Layers, 
  Plus, 
  Edit3, 
  Copy,
  Zap
} from 'lucide-react';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSites: (sites: (Omit<SiteEntry, 'id' | 'updatedAt'> & { id?: string })[]) => void;
  onOpenFullFormWithData: (data: Omit<SiteEntry, 'id' | 'updatedAt'>) => void;
  existingSitesCount?: number;
}

const SAMPLE_TEXT = `Client: Hong Kong Cardiology Hub
3.0 Dashboard: https://v3.cardiology-hk.med.portal/dashboard
3.0 Edit CMS: https://v3.cardiology-hk.med.portal/cms/edit
3.0 Live Site: https://cardiology-hk.med.portal
2.0 Legacy: https://v2.cardiology-hk.med.portal/dashboard
Figma: https://www.figma.com/file/cardio-hk-master-design
Docs: https://docs.google.com/document/d/cardio-spec-v3
User: admin_cardio@bayer.global
Password: CardioVault!2026
Notes: Requires staging VPN tunnel and token key`;

export const SmartAddModal: React.FC<SmartAddModalProps> = ({
  isOpen,
  onClose,
  onSaveSites,
  onOpenFullFormWithData,
  existingSitesCount = 0,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);

  // Editable overrides for detected site
  const [overrideData, setOverrideData] = useState<Partial<DetectedSiteData>>({});

  // Auto-parse on text change
  const parsedSites = useMemo(() => {
    if (!inputText.trim()) return [];
    return parseSmartLinkDump(inputText, existingSitesCount);
  }, [inputText, existingSitesCount]);

  // Reset override whenever input text completely changes
  useEffect(() => {
    setOverrideData({});
    setActiveSiteIndex(0);
  }, [inputText]);

  // Active detected site data with overrides applied
  const currentSite: DetectedSiteData | null = useMemo(() => {
    if (parsedSites.length === 0) return null;
    const base = parsedSites[activeSiteIndex] || parsedSites[0];
    return {
      ...base,
      ...overrideData,
      v2: { ...base.v2, ...(overrideData.v2 || {}) },
      v3: { ...base.v3, ...(overrideData.v3 || {}) },
      credentials: { ...base.credentials, ...(overrideData.credentials || {}) },
    };
  }, [parsedSites, activeSiteIndex, overrideData]);

  if (!isOpen) return null;

  const handleApplySample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const handleSaveCurrent = () => {
    if (!currentSite) return;
    onSaveSites([{
      name: currentSite.name.trim() || 'New Vault Entry',
      color: currentSite.color,
      status: currentSite.status,
      tags: currentSite.tags,
      noFigma: !currentSite.figmaUrl && (!currentSite.extraLinks || currentSite.extraLinks.filter((l) => l.type === 'figma').length === 0),
      v2: currentSite.v2,
      v3: currentSite.v3,
      docsUrl: currentSite.docsUrl,
      figmaUrl: currentSite.figmaUrl,
      extraLinks: currentSite.extraLinks || [],
      credentials: currentSite.credentials,
    }]);
    onClose();
    setInputText('');
  };

  const handleSaveAll = () => {
    if (parsedSites.length === 0) return;
    const all = parsedSites.map((s) => ({
      name: s.name.trim() || 'New Vault Entry',
      color: s.color,
      status: s.status,
      tags: s.tags,
      noFigma: !s.figmaUrl && (!s.extraLinks || s.extraLinks.filter((l) => l.type === 'figma').length === 0),
      v2: s.v2,
      v3: s.v3,
      docsUrl: s.docsUrl,
      figmaUrl: s.figmaUrl,
      extraLinks: s.extraLinks || [],
      credentials: s.credentials,
    }));
    onSaveSites(all);
    onClose();
    setInputText('');
  };

  const handleOpenInFullForm = () => {
    if (!currentSite) return;
    onOpenFullFormWithData({
      name: currentSite.name.trim() || 'New Vault Entry',
      color: currentSite.color,
      status: currentSite.status,
      tags: currentSite.tags,
      noFigma: !currentSite.figmaUrl && (!currentSite.extraLinks || currentSite.extraLinks.filter((l) => l.type === 'figma').length === 0),
      v2: currentSite.v2,
      v3: currentSite.v3,
      docsUrl: currentSite.docsUrl,
      figmaUrl: currentSite.figmaUrl,
      extraLinks: currentSite.extraLinks || [],
      credentials: currentSite.credentials,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Smart Link Add & Auto-Feed
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  AI Link Detector
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste all links or messages at once — the system detects and feeds each field automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Smart Paste Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Paste Links, Chat Message, or Notes</span>
              </label>
              <button
                type="button"
                onClick={handleApplySample}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Try Sample Link Dump
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste any links or text here... e.g.&#10;Site: My Project&#10;https://v3.mysite.com/dashboard&#10;https://figma.com/file/...&#10;https://docs.google.com/...&#10;User: admin@company.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* If multi-site detected */}
          {parsedSites.length > 1 && (
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Multiple Sites Detected ({parsedSites.length}):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {parsedSites.map((site, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSiteIndex(idx);
                        setOverrideData({});
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        activeSiteIndex === idx
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {site.name || `Site ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveAll}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save All {parsedSites.length} Sites to Vault</span>
              </button>
            </div>
          )}

          {/* Detection Preview Card */}
          {currentSite ? (
            <div className="space-y-3.5 bg-slate-50/60 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Detected Site Details
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({currentSite.rawMatchesCount} fields recognized)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={currentSite.status}
                    onChange={(e) => setOverrideData((prev) => ({ ...prev, status: e.target.value as SiteStatus }))}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="Live">🟢 Live</option>
                    <option value="Staging">🟡 Staging</option>
                    <option value="Amends">🟣 Amends</option>
                    <option value="Maintenance">🟠 Maintenance</option>
                  </select>
                  <select
                    value={currentSite.color}
                    onChange={(e) => setOverrideData((prev) => ({ ...prev, color: e.target.value as SiteColor }))}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="emerald">Emerald</option>
                    <option value="rose">Rose</option>
                    <option value="amber">Amber</option>
                  </select>
                </div>
              </div>

              {/* Site Name Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Site / Client Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentSite.name}
                    onChange={(e) => setOverrideData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <Edit3 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
                </div>
              </div>

              {/* 3.0 Endpoints Grid */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  3.0 Next-Gen Endpoints
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">3.0 Dashboard</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v3.dashboardUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v3: { ...(prev.v3 || currentSite.v3), dashboardUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">3.0 Edit / CMS</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v3.editUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v3: { ...(prev.v3 || currentSite.v3), editUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">3.0 Live Site</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v3.liveUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v3: { ...(prev.v3 || currentSite.v3), liveUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                </div>
              </div>

              {/* 2.0 Endpoints Grid */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  2.0 Legacy Endpoints
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">2.0 Dashboard</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v2.dashboardUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v2: { ...(prev.v2 || currentSite.v2), dashboardUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">2.0 Edit / CMS</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v2.editUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v2: { ...(prev.v2 || currentSite.v2), editUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">2.0 Live Site</span>
                    <input
                      type="text"
                      placeholder="Not detected"
                      value={currentSite.v2.liveUrl}
                      onChange={(e) => setOverrideData((prev) => ({
                        ...prev,
                        v2: { ...(prev.v2 || currentSite.v2), liveUrl: e.target.value },
                      }))}
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Docs & Figma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Documentation URL
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Google Docs / Notion"
                    value={currentSite.docsUrl}
                    onChange={(e) => setOverrideData((prev) => ({ ...prev, docsUrl: e.target.value }))}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                  />
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    Figma Design URL
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Figma project URL"
                    value={currentSite.figmaUrl}
                    onChange={(e) => setOverrideData((prev) => ({ ...prev, figmaUrl: e.target.value }))}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono truncate"
                  />
                </div>
              </div>

              {/* Extra Detected Links & Specs */}
              {currentSite.extraLinks && currentSite.extraLinks.length > 0 && (
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    Additional Links & Specs ({currentSite.extraLinks.length})
                  </span>
                  <div className="space-y-1.5">
                    {currentSite.extraLinks.map((extra, idx) => (
                      <div key={extra.id || idx} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-900/40 px-2 py-1.5 rounded-md border border-slate-200/60 dark:border-slate-800">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          extra.type === 'figma'
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300'
                            : extra.type === 'doc'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {extra.type || 'link'}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] shrink-0">
                          {extra.title}:
                        </span>
                        <a
                          href={extra.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline truncate font-mono flex-1"
                        >
                          {extra.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials & Notes */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  Credentials & Notes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Email / Username"
                    value={currentSite.credentials.email}
                    onChange={(e) => setOverrideData((prev) => ({
                      ...prev,
                      credentials: { ...(prev.credentials || currentSite.credentials), email: e.target.value },
                    }))}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Password / Passphrase"
                    value={currentSite.credentials.password}
                    onChange={(e) => setOverrideData((prev) => ({
                      ...prev,
                      credentials: { ...(prev.credentials || currentSite.credentials), password: e.target.value },
                    }))}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono"
                  />
                </div>
                {currentSite.credentials.notes && (
                  <textarea
                    rows={1}
                    value={currentSite.credentials.notes}
                    onChange={(e) => setOverrideData((prev) => ({
                      ...prev,
                      credentials: { ...(prev.credentials || currentSite.credentials), notes: e.target.value },
                    }))}
                    placeholder="Notes"
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none font-mono"
                  />
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-slate-400">Tags:</span>
                {currentSite.tags.length > 0 ? (
                  currentSite.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No tags</span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-2.5">
                <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ready to Detect Links
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Paste any bunch of links above or click <strong>&quot;Try Sample Link Dump&quot;</strong> to watch the detector extract and feed all endpoints in real time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {currentSite && (
              <button
                type="button"
                onClick={handleOpenInFullForm}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl transition flex items-center gap-1.5"
                title="Edit details in full manual modal"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Full Form</span>
              </button>
            )}

            <button
              type="button"
              disabled={!currentSite}
              onClick={handleSaveCurrent}
              className={`px-5 py-2 text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 ${
                currentSite
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20 active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Feed & Add Site to Vault</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
