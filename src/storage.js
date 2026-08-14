const STORAGE_KEY = 'site_info_manager_sites_v1';

// Initial sample data if storage is completely empty
const INITIAL_SAMPLES = [
  {
    id: 'site-sample-1',
    siteName: 'Customer Portal 2.0',
    docsLink: 'https://docs.google.com/document/d/sample-docs-1',
    figmaLink: 'https://www.figma.com/file/sample-design-1',
    dashboard2Id: 'https://dash2.example.com/portal/89410',
    dashboard2EditUrl: 'https://dash2.example.com/portal/89410/edit',
    dashboard3Id: 'https://dash3.example.com/portal/77209',
    dashboard3EditUrl: 'https://dash3.example.com/portal/77209/edit',
    authCode: 'CP2-SECRET-KEY-99',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'site-sample-2',
    siteName: 'E-Commerce Storefront',
    docsLink: 'https://github.com/example/ecommerce-docs',
    figmaLink: 'https://www.figma.com/file/sample-design-2',
    dashboard2Id: 'EC-2022-V2',
    dashboard2EditUrl: 'https://dash2.example.com/store/edit',
    dashboard3Id: 'EC-2024-V3',
    dashboard3EditUrl: '',
    authCode: 'AUTH-STORE-8812',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const Storage = {
  /**
   * Fetch all sites from LocalStorage.
   * If empty, populates initial sample data.
   */
  getAllSites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveAllSites(INITIAL_SAMPLES);
        return INITIAL_SAMPLES;
      }
      return JSON.parse(raw);
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
      authCode: siteData.authCode ? siteData.authCode.trim() : '',
      customLinks: Array.isArray(siteData.customLinks)
        ? siteData.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      createdAt: now,
      updatedAt: now
    };

    sites.unshift(newSite);
    this.saveAllSites(sites);
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
      authCode: siteData.authCode ? siteData.authCode.trim() : '',
      customLinks: Array.isArray(siteData.customLinks)
        ? siteData.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
            url: (l.url || '').trim()
          })).filter(l => l.url)
        : [],
      updatedAt: now
    };

    sites[index] = updatedSite;
    this.saveAllSites(sites);
    return updatedSite;
  },

  /**
   * Delete a site by ID.
   */
  deleteSite(id) {
    let sites = this.getAllSites();
    const initialLength = sites.length;
    sites = sites.filter(s => s.id !== id);
    this.saveAllSites(sites);
    return sites.length < initialLength;
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
      authCode: (item.authCode || '').trim(),
      customLinks: Array.isArray(item.customLinks)
        ? item.customLinks.map(l => ({
            id: l.id || 'link-' + Math.random().toString(36).substring(2, 7),
            label: (l.label || 'Link').trim(),
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
      return {
        mode: 'merge',
        total: existingSites.length,
        added: addedCount,
        updated: updatedCount
      };
    }
  }
};
