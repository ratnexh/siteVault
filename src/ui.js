// Helper: Escape HTML to prevent XSS
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Check if string is HTTP/HTTPS URL
export function isUrl(str) {
  if (!str) return false;
  return /^https?:\/\//i.test(str.trim());
}

// Helper: Format Date
export function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

// Helper: Copy text to clipboard with fallback
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, using fallback:', err);
  }

  // Fallback using textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

// Helper: Download text content as a file
export function downloadFile(filename, content, mimeType = 'application/json') {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return true;
  } catch (err) {
    console.error('File download failed:', err);
    return false;
  }
}

const SITE_THEMES = [
  { border: '#6366f1', bg: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }, // Purple
  { border: '#3b82f6', bg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' }, // Blue
  { border: '#8b5cf6', bg: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }, // Violet
  { border: '#06b6d4', bg: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)' }, // Cyan
];

export function getSiteTheme(siteName = '') {
  let hash = 0;
  for (let i = 0; i < siteName.length; i++) {
    hash = siteName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SITE_THEMES.length;
  return SITE_THEMES[index];
}

export const UI = {
  /**
   * Render Sidebar Sites Navigation Listing
   */
  renderSidebar(sites, activeSiteId = null, filterQuery = '', onNavigateToSite) {
    const listContainer = document.getElementById('sidebarSitesList');
    if (!listContainer) return;

    let filtered = sites;
    if (filterQuery) {
      const q = filterQuery.toLowerCase().trim();
      filtered = sites.filter(s => (s.siteName || '').toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="sidebar-empty">No matching sites</div>`;
      return;
    }

    listContainer.innerHTML = filtered.map(site => {
      const initial = (site.siteName || 'S').charAt(0).toUpperCase();
      const isActive = site.id === activeSiteId;
      const theme = getSiteTheme(site.siteName);
      return `
        <div class="sidebar-site-item ${isActive ? 'active' : ''}" data-site-id="${site.id}" title="${escapeHtml(site.siteName)}">
          <span class="sidebar-site-avatar" style="background: ${theme.bg};">${initial}</span>
          <span class="sidebar-site-name">${escapeHtml(site.siteName)}</span>
          <svg class="sidebar-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      `;
    }).join('');

    // Attach click listeners to sidebar items
    filtered.forEach(site => {
      const itemEl = listContainer.querySelector(`[data-site-id="${site.id}"]`);
      if (itemEl) {
        itemEl.addEventListener('click', () => {
          if (onNavigateToSite) {
            onNavigateToSite(site.id);
          }
        });
      }
    });
  },

  /**
   * Scroll smoothly to site card/row and trigger flash highlight animation
   */
  scrollToAndHighlightSite(siteId, viewMode = 'grid') {
    const targetId = viewMode === 'grid' ? `card-${siteId}` : `row-${siteId}`;
    const element = document.getElementById(targetId);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    element.classList.remove('highlight-flash');
    void element.offsetWidth;
    element.classList.add('highlight-flash');

    setTimeout(() => {
      element.classList.remove('highlight-flash');
    }, 1600);
  },

  /**
   * Render Sites List in Grid or Table mode.
   */
  renderSites(sites, viewMode = 'grid', onSelectSite, onEditSite, onDeleteSite) {
    const container = document.getElementById('sitesContainer');
    const emptyState = document.getElementById('emptyState');
    const countTextEl = document.getElementById('siteCountText');
    if (countTextEl) {
      countTextEl.textContent = `${sites.length} ${sites.length === 1 ? 'site' : 'sites'}`;
    } else if (countBadge) {
      countBadge.textContent = `${sites.length} ${sites.length === 1 ? 'site' : 'sites'}`;
    }

    if (sites.length === 0) {
      container.innerHTML = '';
      container.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    if (viewMode === 'grid') {
      container.className = 'sites-container grid-view';
      container.innerHTML = sites.map(site => this.createCardHTML(site)).join('');
    } else {
      container.className = 'sites-container table-view';
      container.innerHTML = this.createTableHTML(sites);
    }

    // Attach Event Listeners to cards/rows
    sites.forEach(site => {
      if (viewMode === 'grid') {
        const cardEl = document.getElementById(`card-${site.id}`);
        if (cardEl) {
          cardEl.addEventListener('click', (e) => {
            // Avoid triggering detail modal if user clicked directly on link chip or action button
            if (e.target.closest('.link-chip') || e.target.closest('.link-url') || e.target.closest('.card-actions') || e.target.closest('.card-quick-actions') || e.target.closest('.btn-copy-notes') || e.target.closest('.btn-copy-notes-icon')) {
              return;
            }
            onSelectSite(site.id);
          });

          const btnEdit = cardEl.querySelector('.btn-card-edit');
          if (btnEdit) {
            btnEdit.addEventListener('click', (e) => {
              e.stopPropagation();
              onEditSite(site.id);
            });
          }

          const btnDelete = cardEl.querySelector('.btn-card-delete');
          if (btnDelete) {
            btnDelete.addEventListener('click', (e) => {
              e.stopPropagation();
              onDeleteSite(site.id);
            });
          }

          const btnCopyNotes = cardEl.querySelector('.btn-copy-notes-icon') || cardEl.querySelector('.btn-copy-notes');
          if (btnCopyNotes) {
            btnCopyNotes.addEventListener('click', (e) => {
              e.stopPropagation();
              const text = btnCopyNotes.getAttribute('data-notes');
              copyToClipboard(text, 'Notes copied to clipboard!');
            });
          }
        }
      } else {
        const rowEl = document.getElementById(`row-${site.id}`);
        if (rowEl) {
          rowEl.addEventListener('click', (e) => {
            if (e.target.closest('.link-chip') || e.target.closest('.link-url') || e.target.closest('.card-actions') || e.target.closest('.btn-copy-notes')) {
              return;
            }
            onSelectSite(site.id);
          });

          const btnEdit = rowEl.querySelector('.btn-row-edit');
          if (btnEdit) {
            btnEdit.addEventListener('click', (e) => {
              e.stopPropagation();
              onEditSite(site.id);
            });
          }

          const btnDelete = rowEl.querySelector('.btn-row-delete');
          if (btnDelete) {
            btnDelete.addEventListener('click', (e) => {
              e.stopPropagation();
              onDeleteSite(site.id);
            });
          }

          const btnCopyNotes = rowEl.querySelector('.btn-copy-notes');
          if (btnCopyNotes) {
            btnCopyNotes.addEventListener('click', (e) => {
              e.stopPropagation();
              const text = btnCopyNotes.getAttribute('data-notes');
              copyToClipboard(text, 'Notes copied to clipboard!');
            });
          }
        }
      }
    });
  },

  /**
   * Helper to format Dashboard ID / URL display row
   */
  /**
   * Helper to format Dashboard ID / URL display row
   */
  formatDashRow(idText, editUrl, customLinks = [], label = '2.0') {
    if (!idText && !editUrl && (!customLinks || customLinks.length === 0)) return '';

    const chipClass = label === '2.0' ? 'link-chip-dash2' : 'link-chip-dash3';

    let idHtml = '';
    if (idText) {
      if (isUrl(idText)) {
        idHtml = `<a href="${escapeHtml(idText)}" target="_blank" rel="noopener noreferrer" class="link-chip ${chipClass}" title="Open ${label} Dashboard URL">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          ${label} Dashboard URL
        </a>`;
      } else {
        idHtml = `<span class="mono-text dash-id-badge" title="${label} Dashboard ID">${escapeHtml(idText)}</span>`;
      }
    }

    let editHtml = '';
    if (editUrl) {
      editHtml = `<a href="${escapeHtml(editUrl)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-edit" title="Edit ${label} Dashboard URL">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        ${label} Edit URL
      </a>`;
    }

    const customChipsHtml = (customLinks || []).map(link => {
      if (!link.url) return '';
      return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-chip ${chipClass}" title="Open ${escapeHtml(link.label || (label + ' Link'))}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        ${escapeHtml(link.label || (label + ' Link'))}
      </a>`;
    }).join('');

    return `
      <div class="dash-row">
        <span class="dash-row-label">${label}</span>
        ${idHtml}
        ${editHtml}
        ${customChipsHtml}
      </div>
    `;
  },

  /**
   * HTML string for single site card in Grid View
   */
  createCardHTML(site) {
    const settings = Storage.getSettings ? Storage.getSettings() : { openNewTab: true };
    const targetAttr = settings.openNewTab !== false ? 'target="_blank" rel="noopener noreferrer"' : 'target="_self"';

    const docsHTML = site.docsLink
      ? `<a href="${escapeHtml(site.docsLink)}" ${targetAttr} class="link-chip link-chip-docs" title="Open Docs Link">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Docs
         </a>`
      : `<span class="link-chip link-chip-disabled" title="No Docs Provided">No Docs</span>`;

    const figmaHTML = site.figmaLink
      ? `<a href="${escapeHtml(site.figmaLink)}" ${targetAttr} class="link-chip link-chip-figma" title="Open Figma Spec">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 38 57" fill="currentColor"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z"/><path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z"/><path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z"/></svg>
          Figma
         </a>`
      : `<span class="link-chip link-chip-disabled" title="No Figma Spec Provided">No Figma</span>`;

    const customChipsHTML = (site.customLinks || []).map(link => {
      if (!link.url) return '';
      return `<a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-custom" title="Open ${escapeHtml(link.label || 'Link')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        ${escapeHtml(link.label || 'Link')}
      </a>`;
    }).join('');

    // Dashboard 2.0 / 3.0 2-Column Grid Layout matching screenshot
    const hasDash2 = site.dashboard2Id || site.dashboard2EditUrl || (site.customLinks2 && site.customLinks2.length > 0);
    const hasDash3 = site.dashboard3Id || site.dashboard3EditUrl || (site.customLinks3 && site.customLinks3.length > 0);

    let dash2ColumnHTML = '';
    if (hasDash2) {
      const dash2Items = [];
      if (site.dashboard2Id) {
        if (isUrl(site.dashboard2Id)) {
          dash2Items.push(`<a href="${escapeHtml(site.dashboard2Id)}" ${targetAttr} class="link-chip link-chip-dash2" title="Open 2.0 Dashboard URL">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            2.0 Dashboard URL
          </a>`);
        } else {
          dash2Items.push(`<span class="mono-text dash-id-badge" title="2.0 Dashboard ID">${escapeHtml(site.dashboard2Id)}</span>`);
        }
      }
      if (site.dashboard2EditUrl) {
        dash2Items.push(`<a href="${escapeHtml(site.dashboard2EditUrl)}" ${targetAttr} class="link-chip link-chip-edit" title="Edit 2.0 Dashboard URL">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          2.0 Edit URL
        </a>`);
      }
      (site.customLinks2 || []).forEach(link => {
        if (link.url) {
          dash2Items.push(`<a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-dash2" title="Open ${escapeHtml(link.label || '2.0 Link')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            ${escapeHtml(link.label || '2.0 Link')}
          </a>`);
        }
      });

      dash2ColumnHTML = `
        <div class="dash-column">
          <span class="dash-column-badge">2.0</span>
          <div class="dash-column-items">
            ${dash2Items.join('')}
          </div>
        </div>
      `;
    }

    let dash3ColumnHTML = '';
    if (hasDash3) {
      const dash3Items = [];
      if (site.dashboard3Id) {
        if (isUrl(site.dashboard3Id)) {
          dash3Items.push(`<a href="${escapeHtml(site.dashboard3Id)}" ${targetAttr} class="link-chip link-chip-dash3" title="Open 3.0 Dashboard URL">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            3.0 Dashboard URL
          </a>`);
        } else {
          dash3Items.push(`<span class="mono-text dash-id-badge" title="3.0 Dashboard ID">${escapeHtml(site.dashboard3Id)}</span>`);
        }
      }
      if (site.dashboard3EditUrl) {
        dash3Items.push(`<a href="${escapeHtml(site.dashboard3EditUrl)}" ${targetAttr} class="link-chip link-chip-edit" title="Edit 3.0 Dashboard URL">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          3.0 Edit URL
        </a>`);
      }
      (site.customLinks3 || []).forEach(link => {
        if (link.url) {
          dash3Items.push(`<a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-dash3" title="Open ${escapeHtml(link.label || '3.0 Link')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            ${escapeHtml(link.label || '3.0 Link')}
          </a>`);
        }
      });

      dash3ColumnHTML = `
        <div class="dash-column">
          <span class="dash-column-badge">3.0</span>
          <div class="dash-column-items">
            ${dash3Items.join('')}
          </div>
        </div>
      `;
    }

    const isDual = hasDash2 && hasDash3;
    const dashboardSectionHTML = (hasDash2 || hasDash3)
      ? `<div class="dashboards-box-container ${isDual ? 'dual-column' : 'single-column'}">
          ${dash2ColumnHTML}
          ${dash3ColumnHTML}
         </div>`
      : '';

    // Notes & Auth Box Container matching user's mockup
    const hasNotes = Boolean(site.notes && site.notes.trim());
    const notesContentHTML = hasNotes
      ? `<div class="notes-content-box">
          <div class="notes-text">${escapeHtml(site.notes)}</div>
         </div>`
      : `<div class="notes-empty-text">No notes</div>`;

    const initial = (site.siteName || 'S').charAt(0).toUpperCase();
    const theme = getSiteTheme(site.siteName);

    return `
      <div class="site-card glass-card" id="card-${site.id}" data-site-id="${site.id}" style="border-left-color: ${theme.border};">
        <div class="site-card-header">
          <div class="site-card-title-group">
            <span class="card-avatar-badge" style="background: ${theme.bg};">${initial}</span>
            <h3 class="site-title">${escapeHtml(site.siteName)}</h3>
          </div>
        </div>

        <div class="site-links">
          ${docsHTML}
          ${figmaHTML}
          ${customChipsHTML}
        </div>

        ${dashboardSectionHTML}

        <div class="notes-box-container">
          ${notesContentHTML}
        </div>
      </div>
    `;
  },

  /**
   * Compact dashboard formatting for Table View cells
   */
  formatTableDashCell(idText, editUrl, customLinks = [], label = '2.0') {
    if (!idText && !editUrl && (!customLinks || customLinks.length === 0)) return '<span class="text-muted text-sm">-</span>';

    const settings = Storage.getSettings ? Storage.getSettings() : { openNewTab: true };
    const targetAttr = settings.openNewTab !== false ? 'target="_blank" rel="noopener noreferrer"' : 'target="_self"';
    const chipClass = label === '2.0' ? 'link-chip-dash2' : 'link-chip-dash3';

    let idHtml = '';
    if (idText) {
      if (isUrl(idText)) {
        idHtml = `<a href="${escapeHtml(idText)}" ${targetAttr} class="link-chip ${chipClass}" title="Open ${label} Dashboard URL">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Dashboard
        </a>`;
      } else {
        idHtml = `<span class="mono-text dash-id-badge" title="${label} Dashboard ID">${escapeHtml(idText)}</span>`;
      }
    }

    let editHtml = '';
    if (editUrl) {
      editHtml = `<a href="${escapeHtml(editUrl)}" ${targetAttr} class="link-chip link-chip-edit" title="Edit ${label} Dashboard URL">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit
      </a>`;
    }

    const customChipsHtml = (customLinks || []).map(link => {
      if (!link.url) return '';
      return `<a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip ${chipClass}" title="Open ${escapeHtml(link.label || (label + ' Link'))}">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        ${escapeHtml(link.label || (label + ' Link'))}
      </a>`;
    }).join('');

    return `<div class="table-chips-inline">${idHtml}${editHtml}${customChipsHtml}</div>`;
  },

  /**
   * HTML string for Table View
   */
  createTableHTML(sites) {
    const settings = Storage.getSettings ? Storage.getSettings() : { openNewTab: true };
    const targetAttr = settings.openNewTab !== false ? 'target="_blank" rel="noopener noreferrer"' : 'target="_self"';

    const rows = sites.map(site => {
      const docsHTML = site.docsLink
        ? `<a href="${escapeHtml(site.docsLink)}" ${targetAttr} class="link-chip link-chip-docs" title="Open Docs">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Docs
           </a>`
        : '';

      const figmaHTML = site.figmaLink
        ? `<a href="${escapeHtml(site.figmaLink)}" ${targetAttr} class="link-chip link-chip-figma" title="Open Figma">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>
            Figma
           </a>`
        : '';

      const customChipsHTML = (site.customLinks || []).map(link => {
        if (!link.url) return '';
        return `<a href="${escapeHtml(link.url)}" ${targetAttr} class="link-chip link-chip-custom" title="Open ${escapeHtml(link.label || 'Link')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          ${escapeHtml(link.label || 'Link')}
        </a>`;
      }).join('');

      const allLinks = [docsHTML, figmaHTML, customChipsHTML].filter(Boolean).join(' ');
      const linksColumn = allLinks || `<span class="text-muted text-sm">No links</span>`;

      const dash2Cell = this.formatTableDashCell(site.dashboard2Id, site.dashboard2EditUrl, site.customLinks2, '2.0');
      const dash3Cell = this.formatTableDashCell(site.dashboard3Id, site.dashboard3EditUrl, site.customLinks3, '3.0');

      const notesStatus = site.notes
        ? `<div class="notes-pill" title="${escapeHtml(site.notes)}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <span class="notes-val">${escapeHtml(site.notes)}</span>
            <button type="button" class="btn-icon-only btn-copy-notes" title="Copy Notes" data-notes="${escapeHtml(site.notes)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
           </div>`
        : `<span class="text-muted text-sm">-</span>`;

      const initialChar = (site.siteName || 'S').charAt(0).toUpperCase();

      return `
        <tr id="row-${site.id}">
          <td class="table-site-name">
            <div class="site-name-cell">
              <span class="site-avatar">${initialChar}</span>
              <span class="font-semibold site-name-title">${escapeHtml(site.siteName)}</span>
            </div>
          </td>
          <td class="table-links-td">
            <div class="table-links-cell">${linksColumn}</div>
          </td>
          <td class="table-dash2-td">${dash2Cell}</td>
          <td class="table-dash3-td">${dash3Cell}</td>
          <td class="table-notes-td">${notesStatus}</td>
          <td class="table-actions-cell">
            <div class="card-actions">
              <button class="btn-icon-only btn-row-edit" title="Edit Site">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-icon-only btn-row-delete text-danger" title="Delete Site">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <table class="sites-table">
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Quick Links</th>
            <th>2.0 Dashboard</th>
            <th>3.0 Dashboard</th>
            <th>Notes</th>
            <th style="width: 70px; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  },

  /**
   * Toast notification helper
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }
};
