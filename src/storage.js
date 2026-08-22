const STORAGE_KEY = 'site_info_manager_sites_v1';

// Initial sample data if storage is completely empty
const INITIAL_SAMPLES = [];

export const Storage = {
  /**
   * Fetch all sites from LocalStorage.
   * Filters out legacy sample data if present.
   */
  getAllSites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveAllSites(INITIAL_SAMPLES);
        return INITIAL_SAMPLES;
      }
      const sites = JSON.parse(raw);
      // Filter out legacy dummy sample items
      const cleaned = Array.isArray(sites)
        ? sites.filter(s => s && s.id && !String(s.id).startsWith('site-sample-'))
        : [];
      if (cleaned.length !== (Array.isArray(sites) ? sites.length : 0)) {
        this.saveAllSites(cleaned);
      }
      return cleaned;
    } catch (e) {
      console.error('Error reading sites from LocalStorage:', e);
      return [];
    }
  },

  /**
   * Save sites array to LocalStorage.
   */
  saveAllSites(sites) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    } catch (e) {
      console.error('Error writing sites to LocalStorage:', e);
    }
  },

  /**
   * Get a single site by ID.
   */
  getSiteById(id) {
    const sites = this.getAllSites();
    return sites.find(s => s.id === id) || null;
  },

  /**
   * Add a new site.
   */
  addSite(siteData) {
    const sites = this.getAllSites();
    const now = new Date().toISOString();
    const newSite = {
      id: 'site-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      siteName: siteData.siteName.trim(),
      docsLink: siteData.docsLink ? siteData.docsLink.trim() : '',
      figmaLink: siteData.figmaLink ? siteData.figmaLink.trim() : '',
      dashboard2Id: siteData.dashboard2Id ? siteData.dashboard2Id.trim() : '',
      dashboard2EditUrl: siteData.dashboard2EditUrl ? siteData.dashboard2EditUrl.trim() : '',
      dashboard3Id: siteData.dashboard3Id ? siteData.dashboard3Id.trim() : '',
      dashboard3EditUrl: siteData.dashboard3EditUrl ? siteData.dashboard3EditUrl.trim() : '',
      notes: siteData.notes ? siteData.notes.trim() : '',
      customLinks: Array.isArray(siteData.customLinks)
        ? siteData.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks2: Array.isArray(siteData.customLinks2)
        ? siteData.customLinks2.map(l => ({
            id: l.id || 'link2-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '2.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks3: Array.isArray(siteData.customLinks3)
        ? siteData.customLinks3.map(l => ({
            id: l.id || 'link3-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '3.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      createdAt: now,
      updatedAt: now
    };

    sites.unshift(newSite);
    this.saveAllSites(sites);
    this.markUnbackedUpChanges();
    return newSite;
  },

  /**
   * Update an existing site by ID.
   */
  updateSite(id, siteData) {
    const sites = this.getAllSites();
    const index = sites.findIndex(s => s.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const updatedSite = {
      ...sites[index],
      siteName: siteData.siteName.trim(),
      docsLink: siteData.docsLink ? siteData.docsLink.trim() : '',
      figmaLink: siteData.figmaLink ? siteData.figmaLink.trim() : '',
      dashboard2Id: siteData.dashboard2Id ? siteData.dashboard2Id.trim() : '',
      dashboard2EditUrl: siteData.dashboard2EditUrl ? siteData.dashboard2EditUrl.trim() : '',
      dashboard3Id: siteData.dashboard3Id ? siteData.dashboard3Id.trim() : '',
      dashboard3EditUrl: siteData.dashboard3EditUrl ? siteData.dashboard3EditUrl.trim() : '',
      notes: siteData.notes ? siteData.notes.trim() : '',
      customLinks: Array.isArray(siteData.customLinks)
        ? siteData.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks2: Array.isArray(siteData.customLinks2)
        ? siteData.customLinks2.map(l => ({
            id: l.id || 'link2-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '2.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks3: Array.isArray(siteData.customLinks3)
        ? siteData.customLinks3.map(l => ({
            id: l.id || 'link3-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '3.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      updatedAt: now
    };

    sites[index] = updatedSite;
    this.saveAllSites(sites);
    this.markUnbackedUpChanges();
    return updatedSite;
  },

  /**
   * Delete a site by ID.
   */
  deleteSite(id) {
    let sites = this.getAllSites();
    const initialLength = sites.length;
    sites = sites.filter(s => s.id !== id);
    if (sites.length < initialLength) {
      this.saveAllSites(sites);
      this.markUnbackedUpChanges();
      return true;
    }
    return false;
  },

  /**
   * Export all sites dataset as formatted JSON string.
   */
  exportData() {
    const sites = this.getAllSites();
    const payload = {
      app: 'siteVault',
      version: 1,
      exportedAt: new Date().toISOString(),
      siteCount: sites.length,
      sites: sites
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Helper to sanitize/normalize a single imported site item.
   */
  sanitizeSite(item) {
    if (!item || typeof item !== 'object') return null;
    const name = (item.siteName || item.name || '').trim();
    if (!name) return null;

    const now = new Date().toISOString();
    return {
      id: item.id && typeof item.id === 'string' ? item.id : 'site-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      siteName: name,
      docsLink: (item.docsLink || '').trim(),
      figmaLink: (item.figmaLink || '').trim(),
      dashboard2Id: (item.dashboard2Id || '').trim(),
      dashboard2EditUrl: (item.dashboard2EditUrl || '').trim(),
      dashboard3Id: (item.dashboard3Id || '').trim(),
      dashboard3EditUrl: (item.dashboard3EditUrl || '').trim(),
      notes: (item.notes || item.authCode || '').trim(),
      customLinks: Array.isArray(item.customLinks)
        ? item.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks2: Array.isArray(item.customLinks2)
        ? item.customLinks2.map(l => ({
            id: l.id || 'link2-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '2.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      customLinks3: Array.isArray(item.customLinks3)
        ? item.customLinks3.map(l => ({
            id: l.id || 'link3-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || '3.0 Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      createdAt: item.createdAt || now,
      updatedAt: now
    };
  },

  /**
   * Import data into LocalStorage.
   * mode: 'merge' | 'overwrite'
   */
  importData(rawInput, mode = 'merge') {
    let parsed;
    if (typeof rawInput === 'string') {
      try {
        parsed = JSON.parse(rawInput);
      } catch (e) {
        throw new Error('Invalid JSON format. Please check the file or pasted content.');
      }
    } else {
      parsed = rawInput;
    }

    let itemsToImport = [];
    if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sites)) {
      itemsToImport = parsed.sites;
    } else {
      throw new Error('Unrecognized backup format. JSON must be a list of sites or contain a "sites" array.');
    }

    const sanitizedSites = itemsToImport
      .map(item => this.sanitizeSite(item))
      .filter(Boolean);

    if (sanitizedSites.length === 0) {
      throw new Error('No valid sites found in the imported data. Each site must have a valid "siteName".');
    }

    if (mode === 'overwrite') {
      this.saveAllSites(sanitizedSites);
      this.markUnbackedUpChanges();
      return {
        mode: 'overwrite',
        total: sanitizedSites.length,
        added: sanitizedSites.length,
        updated: 0
      };
    } else {
      // Merge mode
      const existingSites = this.getAllSites();
      let addedCount = 0;
      let updatedCount = 0;

      sanitizedSites.forEach(imported => {
        // Find existing site by id or by case-insensitive name match
        const existingIdx = existingSites.findIndex(
          s => s.id === imported.id || s.siteName.toLowerCase() === imported.siteName.toLowerCase()
        );

        if (existingIdx !== -1) {
          // Merge/update: preserve original id and createdAt
          existingSites[existingIdx] = {
            ...imported,
            id: existingSites[existingIdx].id,
            createdAt: existingSites[existingIdx].createdAt || imported.createdAt
          };
          updatedCount++;
        } else {
          existingSites.unshift(imported);
          addedCount++;
        }
      });

      this.saveAllSites(existingSites);
      this.markUnbackedUpChanges();
      return {
        mode: 'merge',
        total: existingSites.length,
        added: addedCount,
        updated: updatedCount
      };
    }
  },

  /**
   * Backup Tracker State Helpers
   */
  markUnbackedUpChanges() {
    localStorage.setItem('site_vault_has_unbacked_up_changes', 'true');
  },

  getLastBackupTime() {
    const ts = localStorage.getItem('site_vault_last_backup_time');
    return ts ? parseInt(ts, 10) : null;
  },

  recordBackupTaken() {
    localStorage.setItem('site_vault_last_backup_time', String(Date.now()));
    localStorage.setItem('site_vault_has_unbacked_up_changes', 'false');
    localStorage.removeItem('site_vault_snooze_backup_until');
  },

  snoozeBackupReminder(durationStr = '3d') {
    let ms = 3 * 24 * 60 * 60 * 1000; // default 3 days
    if (durationStr === '1h') ms = 1 * 60 * 60 * 1000;
    else if (durationStr === '1d') ms = 1 * 24 * 60 * 60 * 1000;
    else if (durationStr === '3d') ms = 3 * 24 * 60 * 60 * 1000;
    else if (durationStr === '7d') ms = 7 * 24 * 60 * 60 * 1000;
    else if (durationStr === '30d') ms = 30 * 24 * 60 * 60 * 1000;

    const snoozeUntil = Date.now() + ms;
    localStorage.setItem('site_vault_snooze_backup_until', String(snoozeUntil));
  },

  shouldShowBackupReminder() {
    const settings = this.getSettings();
    if (!settings.enableBackupReminder) return false;

    const sites = this.getAllSites();
    if (sites.length === 0) return false;

    const snoozeUntil = localStorage.getItem('site_vault_snooze_backup_until');
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil, 10)) {
      return false;
    }

    const hasUnbackedUp = localStorage.getItem('site_vault_has_unbacked_up_changes');
    if (hasUnbackedUp === null) {
      // First run: if sites exist, prompt for backup if no backup timestamp exists
      return !this.getLastBackupTime();
    }

    return hasUnbackedUp === 'true';
  },

  /**
   * Application Settings Helpers
   */
  getSettings() {
    try {
      const raw = localStorage.getItem('site_vault_settings_v1');
      const defaults = {
        enableBackupReminder: true,
        defaultViewMode: 'grid',
        defaultSortMode: 'recent',
        openNewTab: true,
        persistenceRequested: false
      };
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      return {
        enableBackupReminder: true,
        defaultViewMode: 'grid',
        defaultSortMode: 'recent',
        openNewTab: true,
        persistenceRequested: false
      };
    }
  },

  saveSettings(newSettings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem('site_vault_settings_v1', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving settings:', e);
      return null;
    }
  },

  /**
   * Browser Persistent Storage Exception API Helpers
   */
  async checkStoragePersistence() {
    if (navigator.storage && navigator.storage.persisted) {
      return await navigator.storage.persisted();
    }
    return false;
  },

  async requestStoragePersistence() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      if (isPersisted) {
        this.saveSettings({ persistenceRequested: true });
      }
      return isPersisted;
    }
    return false;
  },

  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usageKB = (estimate.usage / 1024).toFixed(1);
      const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
      return { usageKB, quotaMB, raw: estimate };
    }
    return null;
  }
};
