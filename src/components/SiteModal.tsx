'use client';

import React, { useState, useEffect } from 'react';
import { SiteEntry, SiteColor, ResourceLink } from '@/types/site';
import { X, Check, Plus, Trash2, FileText, Figma as FigmaIcon, Link2, Pipette } from 'lucide-react';
import { getColorHex } from '@/lib/storage';

const COLOR_SWATCHES: { value: SiteColor; label: string; bg: string; hex: string }[] = [
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', hex: '#4f46e5' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-600', hex: '#2563eb' },
  { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-600', hex: '#0891b2' },
  { value: 'teal', label: 'Teal', bg: 'bg-teal-600', hex: '#0d9488' },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', hex: '#059669' },
  { value: 'green', label: 'Green', bg: 'bg-green-600', hex: '#16a34a' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-600', hex: '#d97706' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-600', hex: '#ea580c' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-600', hex: '#e11d48' },
  { value: 'red', label: 'Red', bg: 'bg-red-600', hex: '#dc2626' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-600', hex: '#db2777' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-600', hex: '#9333ea' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-600', hex: '#7c3aed' },
  { value: 'slate', label: 'Slate', bg: 'bg-slate-700', hex: '#475569' },
];

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


  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name || '');
      setColor(editingSite.color || 'indigo');
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
      const RANDOM_PALETTE: SiteColor[] = ['indigo', 'blue', 'purple', 'emerald', 'rose', 'amber'];
      setColor(RANDOM_PALETTE[Math.floor(Math.random() * RANDOM_PALETTE.length)]);
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
  }, [editingSite, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: editingSite?.id,
      name: name.trim(),
      color,
      status: editingSite?.status,
      tags: editingSite?.tags,
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
            <div
              className={`w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-md transition-colors ${
                color.startsWith('#') ? '' : (COLOR_SWATCHES.find((s) => s.value === color)?.bg || 'bg-indigo-600')
              }`}
              style={color.startsWith('#') ? { backgroundColor: color } : undefined}
            >
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

          {/* Site Name */}
          <div>
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

          {/* Color Palette & Custom Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Badge Theme & Color
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span
                  className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 inline-block shadow-xs"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <span className="capitalize">
                  {COLOR_SWATCHES.find((s) => s.value === color)?.label || color}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected =
                  color === swatch.value ||
                  (color.startsWith('#') && color.toLowerCase() === swatch.hex.toLowerCase());
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    title={swatch.label}
                    onClick={() => setColor(swatch.value)}
                    className={`w-6 h-6 rounded-full transition-all flex items-center justify-center relative ${swatch.bg} ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-sm'
                        : 'hover:scale-110 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}

              {/* Custom Color Pipette Button */}
              <div className="relative flex items-center">
                <input
                  type="color"
                  id="site-color-pipette"
                  value={color.startsWith('#') ? color : getColorHex(color)}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="site-color-pipette"
                  title="Pick custom color"
                  className={`w-6 h-6 rounded-full border border-dashed border-slate-400 dark:border-slate-500 flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                    color.startsWith('#')
                      ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-sm'
                      : 'hover:border-indigo-500 hover:text-indigo-500 text-slate-500 dark:text-slate-400'
                  }`}
                  style={color.startsWith('#') ? { backgroundColor: color, borderColor: 'transparent' } : undefined}
                >
                  <Pipette className={`w-3 h-3 ${color.startsWith('#') ? 'text-white drop-shadow-sm' : ''}`} />
                </label>
              </div>
            </div>
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
              </div>
            </div>

            {/* Expanded Add Extra Link Button */}
            <button
              type="button"
              onClick={() => {
                setExtraLinks((prev) => [
                  ...prev,
                  {
                    id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    title: `Resource ${prev.length + 1}`,
                    url: '',
                    type: 'other',
                  },
                ]);
              }}
              className="w-full py-2 px-3 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50/70 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/60 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Extra Link</span>
            </button>

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
