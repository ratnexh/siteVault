'use client';

import React, { useState, useEffect } from 'react';
import { SiteEntry, SiteColor, SiteStatus } from '@/types/site';
import { X } from 'lucide-react';

interface SiteModalProps {
  isOpen: boolean;
  editingSite: SiteEntry | null;
  onClose: () => void;
  onSave: (siteData: Omit<SiteEntry, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  editingSite,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<SiteColor>('indigo');
  const [status, setStatus] = useState<SiteStatus>('Live');
  const [tags, setTags] = useState('');
  const [v2DashboardUrl, setV2DashboardUrl] = useState('');
  const [v2EditUrl, setV2EditUrl] = useState('');
  const [v3DashboardUrl, setV3DashboardUrl] = useState('');
  const [v3EditUrl, setV3EditUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name || '');
      setColor(editingSite.color || 'indigo');
      setStatus(editingSite.status || 'Live');
      setTags((editingSite.tags || []).join(', '));
      setV2DashboardUrl(editingSite.v2?.dashboardUrl || '');
      setV2EditUrl(editingSite.v2?.editUrl || '');
      setV3DashboardUrl(editingSite.v3?.dashboardUrl || '');
      setV3EditUrl(editingSite.v3?.editUrl || '');
      setDocsUrl(editingSite.docsUrl || '');
      setFigmaUrl(editingSite.figmaUrl || '');
      setEmail(editingSite.credentials?.email || '');
      setPassword(editingSite.credentials?.password || '');
      setNotes(editingSite.credentials?.notes || '');
    } else {
      setName('');
      setColor('indigo');
      setStatus('Live');
      setTags('');
      setV2DashboardUrl('');
      setV2EditUrl('');
      setV3DashboardUrl('');
      setV3EditUrl('');
      setDocsUrl('');
      setFigmaUrl('');
      setEmail('');
      setPassword('');
      setNotes('');
    }
  }, [editingSite, isOpen]);

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
      noFigma: figmaUrl.trim() === '',
      v2: {
        dashboardUrl: v2DashboardUrl.trim(),
        editUrl: v2EditUrl.trim(),
      },
      v3: {
        dashboardUrl: v3DashboardUrl.trim(),
        editUrl: v3EditUrl.trim(),
      },
      docsUrl: docsUrl.trim(),
      figmaUrl: figmaUrl.trim(),
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
                placeholder="e.g. Radiology Hong Kong"
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
          </div>

          {/* Specs & Figma Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Documentation URL
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Figma Project URL
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
