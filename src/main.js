import { Storage } from './storage.js';
import { UI, escapeHtml, formatDate, copyToClipboard, isUrl, downloadFile } from './ui.js';

// Application State
let currentViewMode = 'grid'; // 'grid' | 'table'
let currentSearchQuery = '';
let selectedSiteId = null;
let activeAuthRevealed = false;
let currentSortMode = 'recent'; // 'recent' | 'name-asc' | 'name-desc'
let currentFilterState = {
  version: 'all', // 'all' | 'v2' | 'v3' | 'both'
  hasDocs: false,
  hasFigma: false,
  hasNotes: false
};

// DOM Elements
const btnOpenAddModal = document.getElementById('btnOpenAddModal');
const btnGridView = document.getElementById('btnGridView');
const btnTableView = document.getElementById('btnTableView');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const btnEmptyStateAction = document.getElementById('btnEmptyStateAction');

// Sidebar Navigation Elements
const appLayout = document.getElementById('appLayout');
const sidebarPanel = document.getElementById('sidebarPanel');
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const btnSidebarCollapse = document.getElementById('btnSidebarCollapse');
const sidebarSearchInput = document.getElementById('sidebarSearchInput');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
let sidebarSearchQuery = '';

// Form Modal Elements
const formModal = document.getElementById('formModal');
const formModalTitle = document.getElementById('formModalTitle');
const siteForm = document.getElementById('siteForm');
const siteIdInput = document.getElementById('siteId');
const siteNameInput = document.getElementById('siteName');
const docsLinkInput = document.getElementById('docsLink');
const figmaLinkInput = document.getElementById('figmaLink');
const dashboard2IdInput = document.getElementById('dashboard2Id');
const dashboard2EditUrlInput = document.getElementById('dashboard2EditUrl');
const dashboard3IdInput = document.getElementById('dashboard3Id');
const dashboard3EditUrlInput = document.getElementById('dashboard3EditUrl');
const notesInput = document.getElementById('notes');
const btnCloseFormModal = document.getElementById('btnCloseFormModal');
const btnCancelForm = document.getElementById('btnCancelForm');
const siteNameError = document.getElementById('siteNameError');
const btnAddCustomLink = document.getElementById('btnAddCustomLink');
const customLinksList = document.getElementById('customLinksList');
const btnAddCustomLink2 = document.getElementById('btnAddCustomLink2');
const customLinks2List = document.getElementById('customLinks2List');
const btnAddCustomLink3 = document.getElementById('btnAddCustomLink3');
const customLinks3List = document.getElementById('customLinks3List');

// Detail Modal Elements
const detailModal = document.getElementById('detailModal');
const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');
const btnBackDetail = document.getElementById('btnBackDetail');
const detailSiteName = document.getElementById('detailSiteName');
const detailDocs = document.getElementById('detailDocs');
const detailFigma = document.getElementById('detailFigma');
const detailCustomLinksCard = document.getElementById('detailCustomLinksCard');
const detailCustomLinks = document.getElementById('detailCustomLinks');
const detailDash2Text = document.getElementById('detailDash2Text');
const detailDash2EditContainer = document.getElementById('detailDash2EditContainer');
const detailDash2CustomLinksContainer = document.getElementById('detailDash2CustomLinksContainer');
const detailDash3Text = document.getElementById('detailDash3Text');
const detailDash3EditContainer = document.getElementById('detailDash3EditContainer');
const detailDash3CustomLinksContainer = document.getElementById('detailDash3CustomLinksContainer');
const btnCopyDash2 = document.getElementById('btnCopyDash2');
const btnCopyDash3 = document.getElementById('btnCopyDash3');
const detailNotes = document.getElementById('detailNotes');
const btnCopyNotes = document.getElementById('btnCopyNotes');
const detailTimestamps = document.getElementById('detailTimestamps');
const btnDetailEdit = document.getElementById('btnDetailEdit');
const btnDetailDelete = document.getElementById('btnDetailDelete');

// Delete Confirmation Modal Elements
const deleteModal = document.getElementById('deleteModal');
const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteSiteTargetName = document.getElementById('deleteSiteTargetName');
let pendingDeleteId = null;

// Export & Import Modal Elements
const btnOpenExportImportModal = document.getElementById('btnOpenExportImportModal');
const exportImportModal = document.getElementById('exportImportModal');
const btnCloseExportImportModal = document.getElementById('btnCloseExportImportModal');
const btnCancelExportImport = document.getElementById('btnCancelExportImport');
const tabBtnExport = document.getElementById('tabBtnExport');
const tabBtnImport = document.getElementById('tabBtnImport');
const tabContentExport = document.getElementById('tabContentExport');
const tabContentImport = document.getElementById('tabContentImport');
const exportTotalSites = document.getElementById('exportTotalSites');
const exportLastDate = document.getElementById('exportLastDate');
const btnDownloadExport = document.getElementById('btnDownloadExport');
const btnCopyExportJson = document.getElementById('btnCopyExportJson');
const importDropzone = document.getElementById('importDropzone');
const importFileInput = document.getElementById('importFileInput');
const importFileName = document.getElementById('importFileName');
const importTextarea = document.getElementById('importTextarea');
const btnClearImportText = document.getElementById('btnClearImportText');
const modeCardMerge = document.getElementById('modeCardMerge');
const modeCardOverwrite = document.getElementById('modeCardOverwrite');
const importErrorAlert = document.getElementById('importErrorAlert');
const importErrorMessage = document.getElementById('importErrorMessage');
const btnSubmitImport = document.getElementById('btnSubmitImport');

let selectedImportFileContent = null;
let lastExportTimestamp = null;

// Initialize App (Support both loading state and ready state)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  const getEl = id => document.getElementById(id);
  const settings = Storage.getSettings();
  if (settings.defaultViewMode) currentViewMode = settings.defaultViewMode;
  if (settings.defaultSortMode) currentSortMode = settings.defaultSortMode;

  // Sync Sort select UI
  const sortSelect = getEl('sortSelect');
  if (sortSelect) sortSelect.value = currentSortMode;

  // Sync View toggle UI
  if (currentViewMode === 'table') {
    getEl('btnTableView')?.classList.add('active');
    getEl('btnGridView')?.classList.remove('active');
  } else {
    getEl('btnGridView')?.classList.add('active');
    getEl('btnTableView')?.classList.remove('active');
  }

  loadAndRenderSites();
  setupEventListeners();
}

/**
 * Filter, sort, and render site list based on search query, sort mode, and active filters
 */
function loadAndRenderSites() {
  const allSites = Storage.getAllSites();
  const query = currentSearchQuery.trim().toLowerCase();

  // 1. Filter sites
  const filteredSites = allSites.filter(site => {
    // Search query matching
    if (query) {
      const nameMatch = site.siteName && site.siteName.toLowerCase().includes(query);
      const dash2Match = site.dashboard2Id && site.dashboard2Id.toLowerCase().includes(query);
      const dash3Match = site.dashboard3Id && site.dashboard3Id.toLowerCase().includes(query);
      const notesMatch = site.notes && site.notes.toLowerCase().includes(query);
      const customLinksMatch = Array.isArray(site.customLinks) && site.customLinks.some(l => (l.label && l.label.toLowerCase().includes(query)) || (l.url && l.url.toLowerCase().includes(query)));
      const customLinks2Match = Array.isArray(site.customLinks2) && site.customLinks2.some(l => (l.label && l.label.toLowerCase().includes(query)) || (l.url && l.url.toLowerCase().includes(query)));
      const customLinks3Match = Array.isArray(site.customLinks3) && site.customLinks3.some(l => (l.label && l.label.toLowerCase().includes(query)) || (l.url && l.url.toLowerCase().includes(query)));
      if (!nameMatch && !dash2Match && !dash3Match && !notesMatch && !customLinksMatch && !customLinks2Match && !customLinks3Match) {
        return false;
      }
    }

    // Version filter
    const has2 = Boolean(site.dashboard2Id || site.dashboard2EditUrl || (site.customLinks2 && site.customLinks2.length > 0));
    const has3 = Boolean(site.dashboard3Id || site.dashboard3EditUrl || (site.customLinks3 && site.customLinks3.length > 0));

    if (currentFilterState.version === 'v2' && !has2) return false;
    if (currentFilterState.version === 'v3' && !has3) return false;
    if (currentFilterState.version === 'both' && (!has2 || !has3)) return false;

    // Asset filter
    if (currentFilterState.hasDocs && !site.docsLink) return false;
    if (currentFilterState.hasFigma && !site.figmaLink) return false;
    if (currentFilterState.hasNotes && !(site.notes && site.notes.trim())) return false;

    return true;
  });

  // 2. Sort sites
  filteredSites.sort((a, b) => {
    if (currentSortMode === 'name-asc') {
      return (a.siteName || '').localeCompare(b.siteName || '');
    } else if (currentSortMode === 'name-desc') {
      return (b.siteName || '').localeCompare(a.siteName || '');
    } else {
      // Default: 'recent' (updatedAt or createdAt descending)
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    }
  });

  UI.renderSites(
    filteredSites,
    currentViewMode,
    handleOpenDetailModal,
    handleOpenEditModal,
    handleOpenDeleteModal
  );

  UI.renderSidebar(
    allSites,
    selectedSiteId,
    sidebarSearchQuery,
    onSidebarNavigate
  );

  updateFilterButtonUI();
  updateBackupReminderUI();
}

function updateBackupReminderUI() {
  const reminderBanner = document.getElementById('backupReminderBanner');
  if (!reminderBanner) return;

  if (Storage.shouldShowBackupReminder()) {
    reminderBanner.classList.remove('hidden');
  } else {
    reminderBanner.classList.add('hidden');
  }
}

/**
 * Update Filter Button UI badge state
 */
function updateFilterButtonUI() {
  const getEl = id => document.getElementById(id);
  const btnFilter = getEl('btnFilter');
  const btnClearFilters = getEl('btnClearFilters');
  const filterBtnText = getEl('filterBtnText');

  let activeCount = 0;
  if (currentFilterState.version !== 'all') activeCount++;
  if (currentFilterState.hasDocs) activeCount++;
  if (currentFilterState.hasFigma) activeCount++;
  if (currentFilterState.hasNotes) activeCount++;

  if (activeCount > 0) {
    btnFilter?.classList.add('active');
    if (filterBtnText) filterBtnText.textContent = `Filters (${activeCount})`;
    btnClearFilters?.classList.remove('hidden');
  } else {
    btnFilter?.classList.remove('active');
    if (filterBtnText) filterBtnText.textContent = 'Filters';
    btnClearFilters?.classList.add('hidden');
  }
}

/**
 * Sidebar item click handler: scroll to site card/row and update active sidebar item
 */
function onSidebarNavigate(siteId) {
  selectedSiteId = siteId;
  const allSites = Storage.getAllSites();

  UI.renderSidebar(allSites, selectedSiteId, sidebarSearchQuery, onSidebarNavigate);
  UI.scrollToAndHighlightSite(siteId, currentViewMode);

  if (window.innerWidth <= 900) {
    closeMobileSidebar();
  }
}

function closeMobileSidebar() {
  if (appLayout) appLayout.classList.remove('sidebar-mobile-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
}

/**
 * Setup All Application Event Listeners using dynamic element getters
 */
function setupEventListeners() {
  const getEl = id => document.getElementById(id);

  // Sidebar Top Tab Click: Reset search/filters & select All Sites
  getEl('btnSidebarTopTab')?.addEventListener('click', (e) => {
    if (e.target.closest('#btnSidebarArrowToggle')) {
      return;
    }
    selectedSiteId = null;
    currentSearchQuery = '';
    const searchInput = getEl('searchInput');
    const btnClearSearch = getEl('btnClearSearch');
    if (searchInput) searchInput.value = '';
    btnClearSearch?.classList.add('hidden');

    loadAndRenderSites();
  });

  // Sidebar Arrow Toggle Click: Collapse/Expand sidebar
  getEl('btnSidebarArrowToggle')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const appLayout = getEl('appLayout');
    const sidebarBackdrop = getEl('sidebarBackdrop');
    if (window.innerWidth <= 900) {
      appLayout?.classList.toggle('sidebar-mobile-open');
      sidebarBackdrop?.classList.toggle('hidden');
    } else {
      appLayout?.classList.toggle('sidebar-collapsed');
    }
  });

  // Sidebar Toggle & Collapse
  getEl('btnToggleSidebar')?.addEventListener('click', () => {
    const appLayout = getEl('appLayout');
    const sidebarBackdrop = getEl('sidebarBackdrop');
    if (window.innerWidth <= 900) {
      appLayout?.classList.toggle('sidebar-mobile-open');
      sidebarBackdrop?.classList.toggle('hidden');
    } else {
      appLayout?.classList.toggle('sidebar-collapsed');
    }
  });

  getEl('btnSidebarCollapse')?.addEventListener('click', () => {
    const appLayout = getEl('appLayout');
    if (window.innerWidth <= 900) {
      closeMobileSidebar();
    } else {
      appLayout?.classList.add('sidebar-collapsed');
    }
  });

  getEl('sidebarBackdrop')?.addEventListener('click', closeMobileSidebar);

  // Sidebar Search/Filter Input
  getEl('sidebarSearchInput')?.addEventListener('input', (e) => {
    sidebarSearchQuery = e.target.value;
    const allSites = Storage.getAllSites();
    UI.renderSidebar(allSites, selectedSiteId, sidebarSearchQuery, onSidebarNavigate);
  });

  // Search Events
  getEl('searchInput')?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    const btnClearSearch = getEl('btnClearSearch');
    if (currentSearchQuery) {
      btnClearSearch?.classList.remove('hidden');
    } else {
      btnClearSearch?.classList.add('hidden');
    }
    loadAndRenderSites();
  });

  getEl('btnClearSearch')?.addEventListener('click', () => {
    const searchInput = getEl('searchInput');
    const btnClearSearch = getEl('btnClearSearch');
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch?.classList.add('hidden');
    searchInput?.focus();
    loadAndRenderSites();
  });

  getEl('btnEmptyStateAction')?.addEventListener('click', () => {
    const searchInput = getEl('searchInput');
    const btnClearSearch = getEl('btnClearSearch');
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch?.classList.add('hidden');
    loadAndRenderSites();
  });

  // View Mode Toggles (Grid / Table)
  getEl('btnGridView')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    currentViewMode = 'grid';
    getEl('btnGridView')?.classList.add('active');
    getEl('btnTableView')?.classList.remove('active');
    loadAndRenderSites();
  });

  getEl('btnTableView')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    currentViewMode = 'table';
    getEl('btnTableView')?.classList.add('active');
    getEl('btnGridView')?.classList.remove('active');
    loadAndRenderSites();
  });

  // Sort Dropdown Listener
  getEl('sortSelect')?.addEventListener('change', (e) => {
    currentSortMode = e.target.value;
    loadAndRenderSites();
  });

  // Filter Button Drawer Toggle Listener
  getEl('btnFilter')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    getEl('filterPanelDrawer')?.classList.toggle('hidden');
    getEl('btnFilter')?.classList.toggle('open');
  });

  // Version Filter Pills Listener
  getEl('versionFilterPills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    const versionVal = pill.getAttribute('data-version');
    if (!versionVal) return;

    currentFilterState.version = versionVal;

    getEl('versionFilterPills').querySelectorAll('.filter-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-version') === versionVal);
    });

    loadAndRenderSites();
  });

  // Asset Filter Pills Listener
  getEl('assetFilterPills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    const assetVal = pill.getAttribute('data-asset');
    if (!assetVal) return;

    if (assetVal === 'docs') currentFilterState.hasDocs = !currentFilterState.hasDocs;
    if (assetVal === 'figma') currentFilterState.hasFigma = !currentFilterState.hasFigma;
    if (assetVal === 'notes') currentFilterState.hasNotes = !currentFilterState.hasNotes;

    pill.classList.toggle('active');
    loadAndRenderSites();
  });

  // Reset Filters Button Listener
  getEl('btnClearFilters')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentFilterState = {
      version: 'all',
      hasDocs: false,
      hasFigma: false,
      hasNotes: false
    };

    // Reset UI Pills
    getEl('versionFilterPills')?.querySelectorAll('.filter-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-version') === 'all');
    });
    getEl('assetFilterPills')?.querySelectorAll('.filter-pill').forEach(p => {
      p.classList.remove('active');
    });

    loadAndRenderSites();
  });

  getEl('btnTableView')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    currentViewMode = 'table';
    getEl('btnTableView')?.classList.add('active');
    getEl('btnGridView')?.classList.remove('active');
    loadAndRenderSites();
  });

  window.addEventListener('resize', () => {
    loadAndRenderSites();
  });

  // Add Site Button
  getEl('btnOpenAddModal')?.addEventListener('click', () => {
    openFormModal('add');
  });

  // Form Modal Events
  getEl('btnCloseFormModal')?.addEventListener('click', closeFormModal);
  getEl('btnCancelForm')?.addEventListener('click', closeFormModal);

  // Custom Links Event Listeners
  getEl('btnAddCustomLink')?.addEventListener('click', () => addCustomLinkRow(getEl('customLinksList'), '', '', 'Title (e.g. Staging)'));
  getEl('btnAddCustomLink2')?.addEventListener('click', () => addCustomLinkRow(getEl('customLinks2List'), '', '', 'Title (e.g. 2.0 Staging)'));
  getEl('btnAddCustomLink3')?.addEventListener('click', () => addCustomLinkRow(getEl('customLinks3List'), '', '', 'Title (e.g. 3.0 Staging)'));

  // Form Submit
  getEl('siteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const siteIdInput = getEl('siteId');
    const siteNameInput = getEl('siteName');
    const siteNameError = getEl('siteNameError');
    const docsLinkInput = getEl('docsLink');
    const figmaLinkInput = getEl('figmaLink');
    const dashboard2IdInput = getEl('dashboard2Id');
    const dashboard2EditUrlInput = getEl('dashboard2EditUrl');
    const dashboard3IdInput = getEl('dashboard3Id');
    const dashboard3EditUrlInput = getEl('dashboard3EditUrl');
    const notesInput = getEl('notes');
    const customLinksList = getEl('customLinksList');
    const customLinks2List = getEl('customLinks2List');
    const customLinks3List = getEl('customLinks3List');

    const id = siteIdInput ? siteIdInput.value : '';
    const name = siteNameInput ? siteNameInput.value.trim() : '';

    if (!name) {
      if (siteNameError) siteNameError.textContent = 'Site Name is required';
      if (siteNameInput) siteNameInput.focus();
      return;
    } else if (siteNameError) {
      siteNameError.textContent = '';
    }

    const formData = {
      siteName: name,
      docsLink: docsLinkInput ? docsLinkInput.value : '',
      figmaLink: figmaLinkInput ? figmaLinkInput.value : '',
      dashboard2Id: dashboard2IdInput ? dashboard2IdInput.value : '',
      dashboard2EditUrl: dashboard2EditUrlInput ? dashboard2EditUrlInput.value : '',
      dashboard3Id: dashboard3IdInput ? dashboard3IdInput.value : '',
      dashboard3EditUrl: dashboard3EditUrlInput ? dashboard3EditUrlInput.value : '',
      notes: notesInput ? notesInput.value : '',
      customLinks: getCustomLinksFromForm(customLinksList, 'Link'),
      customLinks2: getCustomLinksFromForm(customLinks2List, '2.0 Link'),
      customLinks3: getCustomLinksFromForm(customLinks3List, '3.0 Link')
    };

    if (id) {
      // Update Site
      const updated = Storage.updateSite(id, formData);
      if (updated) {
        UI.showToast('Site updated successfully!', 'success');
        if (selectedSiteId === id) {
          handleOpenDetailModal(id);
        }
      }
    } else {
      // Add New Site
      const newSite = Storage.addSite(formData);
      if (newSite) {
        UI.showToast('New site added successfully!', 'success');
      }
    }

    closeFormModal();
    loadAndRenderSites();
  });

  // Detail Modal Events
  getEl('btnCloseDetailModal')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDetailModal();
  });

  getEl('btnBackDetail')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDetailModal();
  });

  getEl('btnCopyNotes')?.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.notes) {
      const ok = await copyToClipboard(site.notes);
      if (ok) UI.showToast('Notes copied to clipboard!', 'info');
      else UI.showToast('Failed to copy Notes', 'error');
    } else {
      UI.showToast('No notes to copy', 'error');
    }
  });

  getEl('btnCopyDash2')?.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.dashboard2Id) {
      const ok = await copyToClipboard(site.dashboard2Id);
      if (ok) UI.showToast('2.0 Dashboard ID copied!', 'info');
    }
  });

  getEl('btnCopyDash3')?.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.dashboard3Id) {
      const ok = await copyToClipboard(site.dashboard3Id);
      if (ok) UI.showToast('3.0 Dashboard ID copied!', 'info');
    }
  });

  getEl('btnDetailEdit')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedSiteId) {
      const siteIdToEdit = selectedSiteId;
      closeDetailModal();
      openFormModal('edit', siteIdToEdit);
    }
  });

  getEl('btnDetailDelete')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedSiteId) {
      const siteIdToDelete = selectedSiteId;
      closeDetailModal();
      handleOpenDeleteModal(siteIdToDelete);
    }
  });

  // Learn More / Site Info Vault Modal Events
  const openInfoVaultModal = (e) => {
    if (e) e.preventDefault();
    getEl('infoVaultModal')?.classList.remove('hidden');
  };

  const closeInfoVaultModal = () => {
    getEl('infoVaultModal')?.classList.add('hidden');
  };

  getEl('btnLearnMorePromo')?.addEventListener('click', openInfoVaultModal);
  getEl('btnCloseInfoVaultModal')?.addEventListener('click', closeInfoVaultModal);
  getEl('btnDoneInfoVault')?.addEventListener('click', closeInfoVaultModal);

  // Delete Modal Events
  getEl('btnCloseDeleteModal')?.addEventListener('click', closeDeleteModal);
  getEl('btnCancelDelete')?.addEventListener('click', closeDeleteModal);

  getEl('btnConfirmDelete')?.addEventListener('click', () => {
    if (!pendingDeleteId) return;

    const deleted = Storage.deleteSite(pendingDeleteId);
    if (deleted) {
      UI.showToast('Site deleted successfully', 'success');
      if (selectedSiteId === pendingDeleteId) {
        closeDetailModal();
      }
    } else {
      UI.showToast('Error deleting site', 'error');
    }

    closeDeleteModal();
    loadAndRenderSites();
  });

  // Export & Import Modal Events
  if (btnOpenExportImportModal) {
    btnOpenExportImportModal.addEventListener('click', openExportImportModal);
  }
  if (btnCloseExportImportModal) {
    btnCloseExportImportModal.addEventListener('click', closeExportImportModal);
  }
  if (btnCancelExportImport) {
    btnCancelExportImport.addEventListener('click', closeExportImportModal);
  }

  if (tabBtnExport) tabBtnExport.addEventListener('click', () => switchExportImportTab('export'));
  if (tabBtnImport) tabBtnImport.addEventListener('click', () => switchExportImportTab('import'));

  if (btnDownloadExport) btnDownloadExport.addEventListener('click', handleExportDownload);
  if (btnCopyExportJson) btnCopyExportJson.addEventListener('click', handleExportCopy);

  // Backup Reminder Banner Handlers
  getEl('btnQuickBackup')?.addEventListener('click', handleExportDownload);
  getEl('snoozeDurationSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;

    Storage.snoozeBackupReminder(val);
    updateBackupReminderUI();

    const labelMap = {
      '1h': '1 Hour',
      '1d': '1 Day',
      '3d': '3 Days',
      '7d': '7 Days',
      '30d': '30 Days'
    };
    UI.showToast(`Backup reminder snoozed for ${labelMap[val] || val}`, 'info');
  });

  // Settings Modal Handlers
  const settingsModal = getEl('settingsModal');

  async function updateSettingsModalState() {
    const settings = Storage.getSettings();
    if (getEl('settingEnableBackupReminder')) getEl('settingEnableBackupReminder').checked = settings.enableBackupReminder;
    if (getEl('settingDefaultViewMode')) getEl('settingDefaultViewMode').value = settings.defaultViewMode || 'grid';
    if (getEl('settingDefaultSortMode')) getEl('settingDefaultSortMode').value = settings.defaultSortMode || 'recent';
    if (getEl('settingOpenNewTab')) getEl('settingOpenNewTab').checked = settings.openNewTab !== false;

    // Check Persistent Storage Exception status
    const isPersisted = await Storage.checkStoragePersistence();
    const statusText = getEl('persistenceStatusText');
    const statusDot = getEl('persistenceDot');
    const btnToggle = getEl('btnTogglePersistence');

    if (isPersisted) {
      if (statusText) statusText.textContent = 'Protected: Persistent Storage Granted by Browser';
      if (statusDot) statusDot.className = 'status-indicator-dot active-green';
      if (btnToggle) {
        btnToggle.textContent = 'Protected ✓';
        btnToggle.className = 'btn btn-sm btn-success disabled';
        btnToggle.disabled = true;
      }
    } else {
      if (statusText) statusText.textContent = 'Standard Storage: Evictable on Routine Browser Cleanup';
      if (statusDot) statusDot.className = 'status-indicator-dot warning-amber';
      if (btnToggle) {
        btnToggle.textContent = 'Enable Protection';
        btnToggle.className = 'btn btn-sm btn-primary';
        btnToggle.disabled = false;
      }
    }

    // Storage Estimate
    const estimate = await Storage.getStorageEstimate();
    const estimateText = getEl('storageEstimateText');
    if (estimateText) {
      if (estimate) {
        estimateText.textContent = `Used: ${estimate.usageKB} KB of allocated ~${estimate.quotaMB} MB quota`;
      } else {
        estimateText.textContent = 'Storage Quota Estimation API unavailable in this browser.';
      }
    }
  }

  const openSettingsModal = async () => {
    await updateSettingsModalState();
    settingsModal?.classList.remove('hidden');
  };

  const closeSettingsModal = () => {
    settingsModal?.classList.add('hidden');
  };

  getEl('btnOpenSettingsModal')?.addEventListener('click', openSettingsModal);
  getEl('btnCloseSettingsModal')?.addEventListener('click', closeSettingsModal);

  getEl('btnTogglePersistence')?.addEventListener('click', async () => {
    const success = await Storage.requestStoragePersistence();
    await updateSettingsModalState();
    if (success) {
      UI.showToast('Browser storage protection enabled! Data is now persistent.', 'success');
    } else {
      UI.showToast('Browser auto-manages storage persistence.', 'info');
    }
  });

  getEl('btnRefreshStorageStats')?.addEventListener('click', async () => {
    await updateSettingsModalState();
    UI.showToast('Storage statistics updated', 'info');
  });

  getEl('btnSaveSettings')?.addEventListener('click', () => {
    const updated = Storage.saveSettings({
      enableBackupReminder: getEl('settingEnableBackupReminder')?.checked !== false,
      defaultViewMode: getEl('settingDefaultViewMode')?.value || 'grid',
      defaultSortMode: getEl('settingDefaultSortMode')?.value || 'recent',
      openNewTab: getEl('settingOpenNewTab')?.checked !== false
    });

    if (updated) {
      currentViewMode = updated.defaultViewMode || 'grid';
      currentSortMode = updated.defaultSortMode || 'recent';

      // Update Toolbar View buttons active state
      if (currentViewMode === 'table') {
        getEl('btnTableView')?.classList.add('active');
        getEl('btnGridView')?.classList.remove('active');
      } else {
        getEl('btnGridView')?.classList.add('active');
        getEl('btnTableView')?.classList.remove('active');
      }

      // Update Toolbar Sort select value
      const sortSelect = getEl('sortSelect');
      if (sortSelect) sortSelect.value = currentSortMode;

      closeSettingsModal();
      loadAndRenderSites();
      updateBackupReminderUI();
      UI.showToast('Settings saved & applied!', 'success');
    }
  });

  getEl('btnSettingsOpenExport')?.addEventListener('click', () => {
    closeSettingsModal();
    openExportImportModal();
  });

  if (importDropzone) {
    importDropzone.addEventListener('click', (e) => {
      if (e.target !== importFileInput) {
        importFileInput.click();
      }
    });

    importDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      importDropzone.classList.add('drag-over');
    });

    importDropzone.addEventListener('dragleave', () => {
      importDropzone.classList.remove('drag-over');
    });

    importDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      importDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImportFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFileSelect(e.target.files[0]);
      }
    });
  }

  if (btnClearImportText) {
    btnClearImportText.addEventListener('click', () => {
      if (importTextarea) importTextarea.value = '';
      hideImportError();
    });
  }

  [modeCardMerge, modeCardOverwrite].forEach(card => {
    if (!card) return;
    card.addEventListener('click', () => {
      if (modeCardMerge) modeCardMerge.classList.remove('active');
      if (modeCardOverwrite) modeCardOverwrite.classList.remove('active');
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (btnSubmitImport) {
    btnSubmitImport.addEventListener('click', handleImportSubmit);
  }

  // Close modals on Escape key or background click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFormModal();
      closeDetailModal();
      closeDeleteModal();
      closeExportImportModal();
    }
  });

  [formModal, detailModal, deleteModal, exportImportModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeFormModal();
        closeDetailModal();
        closeDeleteModal();
        closeExportImportModal();
      }
    });
  });
}

/**
 * Open Form Modal (Add or Edit)
 */
function openFormModal(mode, siteId = null) {
  siteNameError.textContent = '';
  siteForm.reset();
  notesInput.value = '';
  if (customLinksList) customLinksList.innerHTML = '';
  if (customLinks2List) customLinks2List.innerHTML = '';
  if (customLinks3List) customLinks3List.innerHTML = '';

  if (mode === 'edit' && siteId) {
    const site = Storage.getSiteById(siteId);
    if (!site) return;

    formModalTitle.textContent = 'Edit Site';
    siteIdInput.value = site.id;
    siteNameInput.value = site.siteName || '';
    docsLinkInput.value = site.docsLink || '';
    figmaLinkInput.value = site.figmaLink || '';
    dashboard2IdInput.value = site.dashboard2Id || '';
    dashboard2EditUrlInput.value = site.dashboard2EditUrl || '';
    dashboard3IdInput.value = site.dashboard3Id || '';
    dashboard3EditUrlInput.value = site.dashboard3EditUrl || '';
    notesInput.value = site.notes || '';

    if (Array.isArray(site.customLinks)) {
      site.customLinks.forEach(link => addCustomLinkRow(customLinksList, link.label, link.url, 'Title (e.g. Staging)'));
    }
    if (Array.isArray(site.customLinks2)) {
      site.customLinks2.forEach(link => addCustomLinkRow(customLinks2List, link.label, link.url, 'Title (e.g. 2.0 Staging)'));
    }
    if (Array.isArray(site.customLinks3)) {
      site.customLinks3.forEach(link => addCustomLinkRow(customLinks3List, link.label, link.url, 'Title (e.g. 3.0 Staging)'));
    }
  } else {
    formModalTitle.textContent = 'Add New Site';
    siteIdInput.value = '';
  }

  formModal.classList.remove('hidden');
  siteNameInput.focus();
}

function closeFormModal() {
  formModal.classList.add('hidden');
}

/**
 * Open View Details Modal
 */
function handleOpenDetailModal(siteId) {
  const site = Storage.getSiteById(siteId);
  if (!site) return;

  selectedSiteId = site.id;
  const settings = Storage.getSettings();
  const targetAttr = settings.openNewTab !== false ? 'target="_blank" rel="noopener noreferrer"' : 'target="_self"';

  activeAuthRevealed = false;

  detailSiteName.textContent = site.siteName;

  // Docs Link
  if (site.docsLink) {
    detailDocs.innerHTML = `<a href="${escapeHtml(site.docsLink)}" ${targetAttr} class="link-chip link-chip-docs">
      Open Docs ↗
    </a>`;
  } else {
    detailDocs.innerHTML = `<span class="text-muted">Not provided</span>`;
  }

  // Figma Link
  if (site.figmaLink) {
    detailFigma.innerHTML = `<a href="${escapeHtml(site.figmaLink)}" ${targetAttr} class="link-chip link-chip-figma">
      Open Figma ↗
    </a>`;
  } else {
    detailFigma.innerHTML = `<span class="text-muted">Not provided</span>`;
  }

  // Custom Links
  if (Array.isArray(site.customLinks) && site.customLinks.length > 0) {
    detailCustomLinksCard.classList.remove('hidden');
    detailCustomLinks.innerHTML = site.customLinks.map(link => `
      <a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-custom">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        ${escapeHtml(link.label || 'Link')} ↗
      </a>
    `).join('');
  } else {
    detailCustomLinksCard.classList.add('hidden');
  }

  // Dash 2 & 3 IDs
  if (site.dashboard2Id) {
    if (isUrl(site.dashboard2Id)) {
      detailDash2Text.innerHTML = `<a href="${escapeHtml(site.dashboard2Id)}" ${targetAttr} class="link-chip link-chip-dash2">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        2.0 Dashboard URL
      </a>`;
    } else {
      detailDash2Text.textContent = site.dashboard2Id;
    }
  }
  btnCopyDash2.style.display = site.dashboard2Id ? 'inline-flex' : 'none';

  if (site.dashboard2EditUrl) {
    detailDash2EditContainer.innerHTML = `<a href="${escapeHtml(site.dashboard2EditUrl)}" ${targetAttr} class="link-chip link-chip-edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      2.0 Edit URL
    </a>`;
  } else {
    detailDash2EditContainer.innerHTML = '';
  }

  if (detailDash2CustomLinksContainer) {
    if (Array.isArray(site.customLinks2) && site.customLinks2.length > 0) {
      detailDash2CustomLinksContainer.innerHTML = site.customLinks2.map(link => `
        <a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-dash2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          ${escapeHtml(link.label || '2.0 Link')} ↗
        </a>
      `).join('');
    } else {
      detailDash2CustomLinksContainer.innerHTML = '';
    }
  }

  if (site.dashboard3Id) {
    if (isUrl(site.dashboard3Id)) {
      detailDash3Text.innerHTML = `<a href="${escapeHtml(site.dashboard3Id)}" ${targetAttr} class="link-chip link-chip-dash3">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        3.0 Dashboard URL
      </a>`;
    } else {
      detailDash3Text.textContent = site.dashboard3Id;
    }
  } else {
    detailDash3Text.innerHTML = `<span class="text-muted">Not provided</span>`;
  }
  btnCopyDash3.style.display = site.dashboard3Id ? 'inline-flex' : 'none';

  if (site.dashboard3EditUrl) {
    detailDash3EditContainer.innerHTML = `<a href="${escapeHtml(site.dashboard3EditUrl)}" ${targetAttr} class="link-chip link-chip-edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      3.0 Edit URL
    </a>`;
  } else {
    detailDash3EditContainer.innerHTML = '';
  }

  if (detailDash3CustomLinksContainer) {
    if (Array.isArray(site.customLinks3) && site.customLinks3.length > 0) {
      detailDash3CustomLinksContainer.innerHTML = site.customLinks3.map(link => `
        <a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-dash3">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          ${escapeHtml(link.label || '3.0 Link')} ↗
        </a>
      `).join('');
    } else {
      detailDash3CustomLinksContainer.innerHTML = '';
    }
  }

  // Notes
  detailNotes.textContent = site.notes || 'No notes added';

  // Timestamps
  detailTimestamps.innerHTML = `
    <span>Created: ${formatDate(site.createdAt)}</span>
    <span>Updated: ${formatDate(site.updatedAt)}</span>
  `;

  detailModal.classList.remove('hidden');
}

function closeDetailModal() {
  detailModal.classList.add('hidden');
  selectedSiteId = null;
}

/**
 * Trigger Edit from card or detail view
 */
function handleOpenEditModal(siteId) {
  openFormModal('edit', siteId);
}

/**
 * Trigger Delete confirmation modal
 */
function handleOpenDeleteModal(siteId) {
  const site = Storage.getSiteById(siteId);
  if (!site) return;

  pendingDeleteId = site.id;
  deleteSiteTargetName.textContent = `"${site.siteName}"`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  pendingDeleteId = null;
}

/**
 * Add a dynamic custom link row in the form
 */
function addCustomLinkRow(containerEl = customLinksList, label = '', url = '', placeholderTitle = 'Title (e.g. Staging)') {
  if (!containerEl) return;
  const row = document.createElement('div');
  row.className = 'custom-link-row';
  row.innerHTML = `
    <input type="text" class="custom-link-label" placeholder="${escapeHtml(placeholderTitle)}" value="${escapeHtml(label)}">
    <input type="url" class="custom-link-url" placeholder="https://..." value="${escapeHtml(url)}">
    <button type="button" class="btn-icon-only btn-remove-custom-link text-danger" title="Remove Link">&times;</button>
  `;

  row.querySelector('.btn-remove-custom-link').addEventListener('click', () => {
    row.remove();
  });

  containerEl.appendChild(row);
  if (!label && !url) {
    const labelInput = row.querySelector('.custom-link-label');
    if (labelInput) labelInput.focus();
  }
}

/**
 * Read custom link values from form
 */
function getCustomLinksFromForm(containerEl = customLinksList, defaultLabel = 'Link') {
  if (!containerEl) return [];
  const rows = containerEl.querySelectorAll('.custom-link-row');
  const links = [];
  rows.forEach(row => {
    const labelInput = row.querySelector('.custom-link-label');
    const urlInput = row.querySelector('.custom-link-url');
    const label = labelInput ? labelInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    if (url) {
      links.push({ label: label || defaultLabel, url });
    }
  });
  return links;
}

/**
 * Open Export & Import Modal
 */
function openExportImportModal() {
  const sites = Storage.getAllSites();
  if (exportTotalSites) exportTotalSites.textContent = sites.length;
  if (exportLastDate) {
    exportLastDate.textContent = lastExportTimestamp ? formatDate(lastExportTimestamp) : 'Never';
  }

  // Reset import tab state
  selectedImportFileContent = null;
  if (importFileInput) importFileInput.value = '';
  if (importFileName) importFileName.textContent = 'Supports .json files generated by Site Info Manager';
  if (importTextarea) importTextarea.value = '';
  hideImportError();

  switchExportImportTab('export');
  if (exportImportModal) exportImportModal.classList.remove('hidden');
}

function closeExportImportModal() {
  if (exportImportModal) exportImportModal.classList.add('hidden');
}

function switchExportImportTab(tabName) {
  if (tabName === 'export') {
    if (tabBtnExport) tabBtnExport.classList.add('active');
    if (tabBtnImport) tabBtnImport.classList.remove('active');
    if (tabContentExport) tabContentExport.classList.remove('hidden');
    if (tabContentImport) tabContentImport.classList.add('hidden');
    if (btnSubmitImport) btnSubmitImport.classList.add('hidden');
  } else {
    if (tabBtnImport) tabBtnImport.classList.add('active');
    if (tabBtnExport) tabBtnExport.classList.remove('active');
    if (tabContentImport) tabContentImport.classList.remove('hidden');
    if (tabContentExport) tabContentExport.classList.add('hidden');
    if (btnSubmitImport) btnSubmitImport.classList.remove('hidden');
  }
}

function handleExportDownload() {
  const jsonStr = Storage.exportData();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `siteVault_backup_${dateStr}.json`;

  const success = downloadFile(filename, jsonStr, 'application/json');
  if (success) {
    lastExportTimestamp = new Date().toISOString();
    if (exportLastDate) exportLastDate.textContent = formatDate(lastExportTimestamp);
    Storage.recordBackupTaken();
    updateBackupReminderUI();
    UI.showToast('Backup downloaded successfully!', 'success');
  } else {
    UI.showToast('Failed to download backup file', 'error');
  }
}

async function handleExportCopy() {
  const jsonStr = Storage.exportData();
  const success = await copyToClipboard(jsonStr);
  if (success) {
    lastExportTimestamp = new Date().toISOString();
    if (exportLastDate) exportLastDate.textContent = formatDate(lastExportTimestamp);
    Storage.recordBackupTaken();
    updateBackupReminderUI();
    UI.showToast('Backup JSON copied to clipboard!', 'info');
  } else {
    UI.showToast('Failed to copy JSON to clipboard', 'error');
  }
}

function handleImportFileSelect(file) {
  if (!file) return;
  if (!file.name.endsWith('.json') && file.type !== 'application/json' && file.type !== '') {
    showImportError('Please select a valid .json file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImportFileContent = e.target.result;
    if (importFileName) {
      importFileName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }
    hideImportError();
  };
  reader.onerror = () => {
    showImportError('Error reading file. Please try again.');
  };
  reader.readAsText(file);
}

function showImportError(msg) {
  if (importErrorMessage) importErrorMessage.textContent = msg;
  if (importErrorAlert) importErrorAlert.classList.remove('hidden');
}

function hideImportError() {
  if (importErrorAlert) importErrorAlert.classList.add('hidden');
  if (importErrorMessage) importErrorMessage.textContent = '';
}

function handleImportSubmit() {
  hideImportError();

  const rawInput = selectedImportFileContent || (importTextarea ? importTextarea.value.trim() : '');
  if (!rawInput) {
    showImportError('Please upload a backup .json file or paste JSON data into the text box.');
    return;
  }

  const selectedModeRadio = document.querySelector('input[name="importMode"]:checked');
  const mode = selectedModeRadio ? selectedModeRadio.value : 'merge';

  if (mode === 'overwrite') {
    const confirmOverwrite = window.confirm(
      'WARNING: Overwrite Mode will erase all existing sites and replace them with the imported backup.\n\nAre you sure you want to proceed?'
    );
    if (!confirmOverwrite) return;
  }

  try {
    const result = Storage.importData(rawInput, mode);
    let msg = '';
    if (result.mode === 'overwrite') {
      msg = `Import successful! Overwrote data with ${result.total} site(s).`;
    } else {
      msg = `Import successful! Added ${result.added} new, updated ${result.updated} site(s).`;
    }

    UI.showToast(msg, 'success');
    closeExportImportModal();
    loadAndRenderSites();
  } catch (err) {
    showImportError(err.message || 'Import failed. Please verify your JSON content.');
  }
}
