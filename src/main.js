import { Storage } from './storage.js';
import { UI, escapeHtml, formatDate, copyToClipboard, isUrl, downloadFile } from './ui.js';

// Application State
let currentViewMode = 'grid'; // 'grid' | 'table'
let currentSearchQuery = '';
let selectedSiteId = null;
let activeAuthRevealed = false;

// DOM Elements
const btnOpenAddModal = document.getElementById('btnOpenAddModal');
const btnGridView = document.getElementById('btnGridView');
const btnTableView = document.getElementById('btnTableView');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const btnEmptyStateAction = document.getElementById('btnEmptyStateAction');

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
const authCodeInput = document.getElementById('authCode');
const btnToggleFormAuthVisibility = document.getElementById('btnToggleFormAuthVisibility');
const btnCloseFormModal = document.getElementById('btnCloseFormModal');
const btnCancelForm = document.getElementById('btnCancelForm');
const siteNameError = document.getElementById('siteNameError');
const btnAddCustomLink = document.getElementById('btnAddCustomLink');
const customLinksList = document.getElementById('customLinksList');

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
const detailDash3Text = document.getElementById('detailDash3Text');
const detailDash3EditContainer = document.getElementById('detailDash3EditContainer');
const btnCopyDash2 = document.getElementById('btnCopyDash2');
const btnCopyDash3 = document.getElementById('btnCopyDash3');
const detailAuthCode = document.getElementById('detailAuthCode');
const btnToggleAuthReveal = document.getElementById('btnToggleAuthReveal');
const authRevealText = document.getElementById('authRevealText');
const btnCopyAuthCode = document.getElementById('btnCopyAuthCode');
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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadAndRenderSites();
  setupEventListeners();
});

/**
 * Filter and render site list based on search query
 */
function loadAndRenderSites() {
  const allSites = Storage.getAllSites();
  const query = currentSearchQuery.trim().toLowerCase();

  const filteredSites = allSites.filter(site => {
    if (!query) return true;
    const nameMatch = site.siteName && site.siteName.toLowerCase().includes(query);
    const dash2Match = site.dashboard2Id && site.dashboard2Id.toLowerCase().includes(query);
    const dash3Match = site.dashboard3Id && site.dashboard3Id.toLowerCase().includes(query);
    return nameMatch || dash2Match || dash3Match;
  });

  UI.renderSites(
    filteredSites,
    currentViewMode,
    handleOpenDetailModal,
    handleOpenEditModal,
    handleOpenDeleteModal
  );
}

/**
 * Setup All Application Event Listeners
 */
function setupEventListeners() {
  // Search Events
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    if (currentSearchQuery) {
      btnClearSearch.classList.remove('hidden');
    } else {
      btnClearSearch.classList.add('hidden');
    }
    loadAndRenderSites();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch.classList.add('hidden');
    searchInput.focus();
    loadAndRenderSites();
  });

  btnEmptyStateAction.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    btnClearSearch.classList.add('hidden');
    loadAndRenderSites();
  });

  // View Mode Toggles
  btnGridView.addEventListener('click', () => {
    currentViewMode = 'grid';
    btnGridView.classList.add('active');
    btnTableView.classList.remove('active');
    loadAndRenderSites();
  });

  btnTableView.addEventListener('click', () => {
    currentViewMode = 'table';
    btnTableView.classList.add('active');
    btnGridView.classList.remove('active');
    loadAndRenderSites();
  });

  // Add Site Button
  btnOpenAddModal.addEventListener('click', () => {
    openFormModal('add');
  });

  // Form Modal Events
  btnCloseFormModal.addEventListener('click', closeFormModal);
  btnCancelForm.addEventListener('click', closeFormModal);

  // Toggle Auth Visibility in Form
  btnToggleFormAuthVisibility.addEventListener('click', () => {
    if (authCodeInput.type === 'password') {
      authCodeInput.type = 'text';
    } else {
      authCodeInput.type = 'password';
    }
  });

  // Custom Links Event Listeners
  btnAddCustomLink?.addEventListener('click', () => addCustomLinkRow('', ''));

  // Form Submit
  siteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = siteIdInput.value;
    const name = siteNameInput.value.trim();

    if (!name) {
      siteNameError.textContent = 'Site Name is required';
      siteNameInput.focus();
      return;
    } else {
      siteNameError.textContent = '';
    }

    const formData = {
      siteName: name,
      docsLink: docsLinkInput.value,
      figmaLink: figmaLinkInput.value,
      dashboard2Id: dashboard2IdInput.value,
      dashboard2EditUrl: dashboard2EditUrlInput.value,
      dashboard3Id: dashboard3IdInput.value,
      dashboard3EditUrl: dashboard3EditUrlInput.value,
      authCode: authCodeInput.value,
      customLinks: getCustomLinksFromForm()
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
  btnCloseDetailModal.addEventListener('click', closeDetailModal);
  btnBackDetail.addEventListener('click', closeDetailModal);



  btnCopyAuthCode.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.authCode) {
      const ok = await copyToClipboard(site.authCode);
      if (ok) UI.showToast('Auth Code copied to clipboard!', 'info');
      else UI.showToast('Failed to copy Auth Code', 'error');
    } else {
      UI.showToast('No Auth Code to copy', 'error');
    }
  });

  btnCopyDash2.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.dashboard2Id) {
      const ok = await copyToClipboard(site.dashboard2Id);
      if (ok) UI.showToast('2.0 Dashboard ID copied!', 'info');
    }
  });

  btnCopyDash3.addEventListener('click', async () => {
    if (!selectedSiteId) return;
    const site = Storage.getSiteById(selectedSiteId);
    if (site && site.dashboard3Id) {
      const ok = await copyToClipboard(site.dashboard3Id);
      if (ok) UI.showToast('3.0 Dashboard ID copied!', 'info');
    }
  });

  btnDetailEdit.addEventListener('click', () => {
    if (selectedSiteId) {
      closeDetailModal();
      handleOpenEditModal(selectedSiteId);
    }
  });

  btnDetailDelete.addEventListener('click', () => {
    if (selectedSiteId) {
      handleOpenDeleteModal(selectedSiteId);
    }
  });

  // Delete Modal Events
  btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  btnCancelDelete.addEventListener('click', closeDeleteModal);

  btnConfirmDelete.addEventListener('click', () => {
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
  authCodeInput.type = 'password';
  customLinksList.innerHTML = '';

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
    authCodeInput.value = site.authCode || '';

    if (Array.isArray(site.customLinks)) {
      site.customLinks.forEach(link => addCustomLinkRow(link.label, link.url));
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
  activeAuthRevealed = false;

  detailSiteName.textContent = site.siteName;

  // Docs Link
  if (site.docsLink) {
    detailDocs.innerHTML = `<a href="${escapeHtml(site.docsLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-docs">
      Open Docs ↗
    </a>`;
  } else {
    detailDocs.innerHTML = `<span class="text-muted">Not provided</span>`;
  }

  // Figma Link
  if (site.figmaLink) {
    detailFigma.innerHTML = `<a href="${escapeHtml(site.figmaLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-figma">
      Open Figma ↗
    </a>`;
  } else {
    detailFigma.innerHTML = `<span class="text-muted">Not provided</span>`;
  }

  // Custom Links
  if (Array.isArray(site.customLinks) && site.customLinks.length > 0) {
    detailCustomLinksCard.classList.remove('hidden');
    detailCustomLinks.innerHTML = site.customLinks.map(link => `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-custom">
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
      detailDash2Text.innerHTML = `<a href="${escapeHtml(site.dashboard2Id)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-dash2">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        2.0 Dashboard URL
      </a>`;
    } else {
      detailDash2Text.textContent = site.dashboard2Id;
    }
  } else {
    detailDash2Text.textContent = '-';
  }
  btnCopyDash2.style.display = site.dashboard2Id ? 'inline-flex' : 'none';

  if (site.dashboard2EditUrl) {
    detailDash2EditContainer.innerHTML = `<a href="${escapeHtml(site.dashboard2EditUrl)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      2.0 Edit URL
    </a>`;
  } else {
    detailDash2EditContainer.innerHTML = '';
  }

  if (site.dashboard3Id) {
    if (isUrl(site.dashboard3Id)) {
      detailDash3Text.innerHTML = `<a href="${escapeHtml(site.dashboard3Id)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-dash3">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        3.0 Dashboard URL
      </a>`;
    } else {
      detailDash3Text.textContent = site.dashboard3Id;
    }
  } else {
    detailDash3Text.textContent = '-';
  }
  btnCopyDash3.style.display = site.dashboard3Id ? 'inline-flex' : 'none';

  if (site.dashboard3EditUrl) {
    detailDash3EditContainer.innerHTML = `<a href="${escapeHtml(site.dashboard3EditUrl)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-edit">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      3.0 Edit URL
    </a>`;
  } else {
    detailDash3EditContainer.innerHTML = '';
  }

  // Auth Code
  detailAuthCode.textContent = site.authCode || '(Not set)';

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
function addCustomLinkRow(label = '', url = '') {
  if (!customLinksList) return;
  const row = document.createElement('div');
  row.className = 'custom-link-row';
  row.innerHTML = `
    <input type="text" class="custom-link-label" placeholder="Title (e.g. Staging)" value="${escapeHtml(label)}">
    <input type="url" class="custom-link-url" placeholder="https://..." value="${escapeHtml(url)}">
    <button type="button" class="btn-icon-only btn-remove-custom-link text-danger" title="Remove Link">&times;</button>
  `;

  row.querySelector('.btn-remove-custom-link').addEventListener('click', () => {
    row.remove();
  });

  customLinksList.appendChild(row);
  if (!label && !url) {
    const labelInput = row.querySelector('.custom-link-label');
    if (labelInput) labelInput.focus();
  }
}

/**
 * Read custom link values from form
 */
function getCustomLinksFromForm() {
  if (!customLinksList) return [];
  const rows = customLinksList.querySelectorAll('.custom-link-row');
  const links = [];
  rows.forEach(row => {
    const labelInput = row.querySelector('.custom-link-label');
    const urlInput = row.querySelector('.custom-link-url');
    const label = labelInput ? labelInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    if (url) {
      links.push({ label: label || 'Link', url });
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
