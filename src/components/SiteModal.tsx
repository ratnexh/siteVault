'use client';

import React, { useState, useEffect } from 'react';
import { SiteEntry, SiteColor, SiteStatus, ResourceLink } from '@/types/site';
import { X, Sparkles, ChevronDown, ChevronUp, Zap, Check, Plus, Trash2, FileText, Figma as FigmaIcon, Link2 } from 'lucide-react';
import { parseSingleSiteDump } from '@/lib/smartDetector';

interface SiteModalProps {
  isOpen: boolean;
  editingSite: SiteEntry | null;
  initialData?: Partial<Omit<SiteEntry, 'id' | 'updatedAt'>> | null;
  onClose: () => void;
  onSave: (siteData: Omit<SiteEntry, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  editingSite,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<SiteColor>('indigo');
  const [status, setStatus] = useState<SiteStatus>('Live');
  const [tags, setTags] = useState('');
  const [v2DashboardUrl, setV2DashboardUrl] = useState('');
  const [v2EditUrl, setV2EditUrl] = useState('');
  const [v2LiveUrl, setV2LiveUrl] = useState('');
  const [v3DashboardUrl, setV3DashboardUrl] = useState('');
  const [v3EditUrl, setV3EditUrl] = useState('');
  const [v3LiveUrl, setV3LiveUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [extraLinks, setExtraLinks] = useState<ResourceLink[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  // Smart Fill drawer inside modal
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const [smartFillText, setSmartFillText] = useState('');
  const [smartFillSuccess, setSmartFillSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name || '');
      setColor(editingSite.color || 'indigo');
      setStatus(editingSite.status || 'Live');
      setTags((editingSite.tags || []).join(', '));
      setV2DashboardUrl(editingSite.v2?.dashboardUrl || '');
      setV2EditUrl(editingSite.v2?.editUrl || '');
      setV2LiveUrl(editingSite.v2?.liveUrl || '');
      setV3DashboardUrl(editingSite.v3?.dashboardUrl || '');
      setV3EditUrl(editingSite.v3?.editUrl || '');
      setV3LiveUrl(editingSite.v3?.liveUrl || '');
      setDocsUrl(editingSite.docsUrl || '');
      setFigmaUrl(editingSite.figmaUrl || '');
      setExtraLinks(editingSite.extraLinks ? [...editingSite.extraLinks] : []);
      setEmail(editingSite.credentials?.email || '');
      setPassword(editingSite.credentials?.password || '');
      setNotes(editingSite.credentials?.notes || '');
    } else if (initialData) {
      setName(initialData.name || '');
      setColor(initialData.color || 'indigo');
      setStatus(initialData.status || 'Live');
      setTags((initialData.tags || []).join(', '));
      setV2DashboardUrl(initialData.v2?.dashboardUrl || '');
      setV2EditUrl(initialData.v2?.editUrl || '');
      setV2LiveUrl(initialData.v2?.liveUrl || '');
      setV3DashboardUrl(initialData.v3?.dashboardUrl || '');
      setV3EditUrl(initialData.v3?.editUrl || '');
      setV3LiveUrl(initialData.v3?.liveUrl || '');
      setDocsUrl(initialData.docsUrl || '');
      setFigmaUrl(initialData.figmaUrl || '');
      setExtraLinks(initialData.extraLinks ? [...initialData.extraLinks] : []);
      setEmail(initialData.credentials?.email || '');
      setPassword(initialData.credentials?.password || '');
      setNotes(initialData.credentials?.notes || '');
    } else {
      setName('');
      setColor('indigo');
      setStatus('Live');
      setTags('');
      setV2DashboardUrl('');
      setV2EditUrl('');
      setV2LiveUrl('');
      setV3DashboardUrl('');
      setV3EditUrl('');
      setV3LiveUrl('');
      setDocsUrl('');
      setFigmaUrl('');
      setExtraLinks([]);
      setEmail('');
      setPassword('');
      setNotes('');
    }
    setSmartFillText('');
    setSmartFillSuccess(null);
  }, [editingSite, initialData, isOpen]);

  const handleApplySmartFill = () => {
    if (!smartFillText.trim()) return;
    const detected = parseSingleSiteDump(smartFillText);
    if (detected.name && (!name || name === 'New Vault Entry')) setName(detected.name);
    if (detected.color) setColor(detected.color);
    if (detected.status) setStatus(detected.status);
    if (detected.tags.length > 0) setTags(detected.tags.join(', '));
    if (detected.v2.dashboardUrl) setV2DashboardUrl(detected.v2.dashboardUrl);
    if (detected.v2.editUrl) setV2EditUrl(detected.v2.editUrl);
    if (detected.v2.liveUrl) setV2LiveUrl(detected.v2.liveUrl);
    if (detected.v3.dashboardUrl) setV3DashboardUrl(detected.v3.dashboardUrl);
    if (detected.v3.editUrl) setV3EditUrl(detected.v3.editUrl);
    if (detected.v3.liveUrl) setV3LiveUrl(detected.v3.liveUrl);
    if (detected.docsUrl) setDocsUrl(detected.docsUrl);
    if (detected.figmaUrl) setFigmaUrl(detected.figmaUrl);
    if (detected.extraLinks && detected.extraLinks.length > 0) {
      setExtraLinks((prev) => {
        const existingUrls = new Set([
          docsUrl,
          figmaUrl,
          detected.docsUrl,
          detected.figmaUrl,
          ...prev.map((l) => l.url),
        ]);
        const newOnes = detected.extraLinks.filter((l) => !existingUrls.has(l.url));
        return [...prev, ...newOnes];
      });
    }
    if (detected.credentials.email) setEmail(detected.credentials.email);
    if (detected.credentials.password) setPassword(detected.credentials.password);
    if (detected.credentials.notes) setNotes(detected.credentials.notes);

    setSmartFillSuccess(`✨ Detected & fed ${detected.rawMatchesCount} fields!`);
    setTimeout(() => setSmartFillSuccess(null), 4000);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    onSave({
      id: editingSite?.id,
      name: name.trim(),
      color,
      status,
      tags: parsedTags,
      noFigma: figmaUrl.trim() === '' && extraLinks.filter((l) => l.type === 'figma').length === 0,
      v2: {
        dashboardUrl: v2DashboardUrl.trim(),
        editUrl: v2EditUrl.trim(),
        liveUrl: v2LiveUrl.trim(),
      },
      v3: {
        dashboardUrl: v3DashboardUrl.trim(),
        editUrl: v3EditUrl.trim(),
        liveUrl: v3LiveUrl.trim(),
      },
      docsUrl: docsUrl.trim(),
      figmaUrl: figmaUrl.trim(),
      extraLinks: extraLinks.filter((l) => l.url.trim() !== ''),
      credentials: {
        email: email.trim(),
        password: password.trim(),
        notes: notes.trim(),
      },
    });
  };

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '+';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {initial}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSite ? `Edit "${editingSite.name}"` : 'Add New Site Vault Entry'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Store credentials, dashboard URLs and specs
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Smart Auto-Fill Bar */}
          <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-indigo-50/80 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 p-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSmartFillOpen(!smartFillOpen)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:text-indigo-700 dark:hover:text-indigo-100 transition"
              >
                <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span>⚡ Smart Auto-Fill from Links / Text Dump</span>
                {smartFillOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {smartFillSuccess && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" />
                  {smartFillSuccess}
                </span>
              )}
            </div>

            {smartFillOpen && (
              <div className="mt-3 space-y-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Paste raw text or all URLs from Jira, email, Slack — endpoints, Figma, Docs & credentials will be auto-detected and populated below.
                </p>
                <textarea
                  rows={3}
                  value={smartFillText}
                  onChange={(e) => setSmartFillText(e.target.value)}
                  placeholder="Paste links e.g.&#10;https://v3.mysite.com/dashboard&#10;https://figma.com/file/...&#10;user: admin@example.com"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleApplySmartFill}
                    disabled={!smartFillText.trim()}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                      smartFillText.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto-Detect & Fill Fields</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Site Name & Badge Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site / Client Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enter site name here..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Badge Theme
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as SiteColor)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="indigo">Indigo Accent</option>
                <option value="blue">Blue Accent</option>
                <option value="purple">Purple Accent</option>
                <option value="emerald">Emerald Accent</option>
                <option value="rose">Rose Accent</option>
                <option value="amber">Amber Accent</option>
              </select>
            </div>
          </div>

          {/* Status & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deployment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SiteStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Live">🟢 Live Production</option>
                <option value="Staging">🟡 In Development / Staging</option>
                <option value="Amends">🟣 Pending Amends</option>
                <option value="Maintenance">🟠 Maintenance Mode</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Docs, Figma, Docs copy editable"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2.0 URLs Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                2.0 Legacy / Standard Endpoints
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="url"
                value={v2DashboardUrl}
                onChange={(e) => setV2DashboardUrl(e.target.value)}
                placeholder="2.0 Dashboard URL (https://...)"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <input
                type="url"
                value={v2EditUrl}
                onChange={(e) => setV2EditUrl(e.target.value)}
                placeholder="2.0 Edit / CMS URL (https://...)"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="url"
              value={v2LiveUrl}
              onChange={(e) => setV2LiveUrl(e.target.value)}
              placeholder="2.0 Live Production Site URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* 3.0 URLs Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                3.0 Next-Gen Endpoints
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="url"
                value={v3DashboardUrl}
                onChange={(e) => setV3DashboardUrl(e.target.value)}
                placeholder="3.0 Dashboard URL (https://...)"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <input
                type="url"
                value={v3EditUrl}
                onChange={(e) => setV3EditUrl(e.target.value)}
                placeholder="3.0 Edit / CMS URL (https://...)"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="url"
              value={v3LiveUrl}
              onChange={(e) => setV3LiveUrl(e.target.value)}
              placeholder="3.0 Live Production Site URL (https://...)"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Specs & Figma Links */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Documentation URL</span>
                  <span className="text-[10px] text-slate-400 font-normal">Primary</span>
                </label>
                <input
                  type="url"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="mt-1.5 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setExtraLinks((prev) => [
                        ...prev,
                        {
                          id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          title: `Doc Resource ${prev.filter((l) => l.type === 'doc').length + 2}`,
                          url: '',
                          type: 'doc',
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Extra Doc Link</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Figma Project URL</span>
                  <span className="text-[10px] text-slate-400 font-normal">Primary</span>
                </label>
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://figma.com/file/..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="mt-1.5 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setExtraLinks((prev) => [
                        ...prev,
                        {
                          id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          title: `Figma Specs ${prev.filter((l) => l.type === 'figma').length + 2}`,
                          url: '',
                          type: 'figma',
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Extra Figma Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Extra Docs & Figma Links Repeater */}
            {extraLinks.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Additional Links & Specs ({extraLinks.length})</span>
                </div>
                {extraLinks.map((link, idx) => (
                  <div key={link.id || idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <select
                      value={link.type || 'other'}
                      onChange={(e) => {
                        const newType = e.target.value as 'doc' | 'figma' | 'other';
                        setExtraLinks((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, type: newType } : item))
                        );
                      }}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                    >
                      <option value="doc">📄 Doc</option>
                      <option value="figma">🎨 Figma</option>
                      <option value="other">🔗 Link</option>
                    </select>

                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setExtraLinks((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, title: newTitle } : item))
                        );
                      }}
                      placeholder="Title (e.g. Mobile UI, Spec Sheet)"
                      className="w-1/3 min-w-[120px] px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />

                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setExtraLinks((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, url: newUrl } : item))
                        );
                      }}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => setExtraLinks((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credentials & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credentials & Secure Notes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username / Email"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password / Passphrase"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional token keys, Space keys, IP whitelist instructions..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              Save Site Vault Entry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
