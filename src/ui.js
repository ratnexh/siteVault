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

export const UI = {
  /**
   * Render Sites List in Grid or Table mode.
   */
  renderSites(sites, viewMode = 'grid', onSelectSite, onEditSite, onDeleteSite) {
    const container = document.getElementById('sitesContainer');
    const emptyState = document.getElementById('emptyState');
    const countBadge = document.getElementById('siteCountBadge');

    countBadge.textContent = `${sites.length} ${sites.length === 1 ? 'site' : 'sites'}`;

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
            if (e.target.closest('.link-chip') || e.target.closest('.link-url') || e.target.closest('.card-actions') || e.target.closest('.btn-copy-auth')) {
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

          const btnCopyAuth = cardEl.querySelector('.btn-copy-auth');
          if (btnCopyAuth) {
            btnCopyAuth.addEventListener('click', (e) => {
              e.stopPropagation();
              const code = btnCopyAuth.getAttribute('data-auth');
              copyToClipboard(code, 'Auth code copied to clipboard!');
            });
          }
        }
      } else {
        const rowEl = document.getElementById(`row-${site.id}`);
        if (rowEl) {
          rowEl.addEventListener('click', (e) => {
            if (e.target.closest('.link-chip') || e.target.closest('.link-url') || e.target.closest('.card-actions') || e.target.closest('.btn-copy-auth')) {
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

          const btnCopyAuth = rowEl.querySelector('.btn-copy-auth');
          if (btnCopyAuth) {
            btnCopyAuth.addEventListener('click', (e) => {
              e.stopPropagation();
              const code = btnCopyAuth.getAttribute('data-auth');
              copyToClipboard(code, 'Auth code copied to clipboard!');
            });
          }
        }
      }
    });
  },

  /**
   * Helper to format Dashboard ID / URL display row
   */
  formatDashRow(idText, editUrl, label) {
    if (!idText && !editUrl) return '';

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

    return `
      <div class="dash-row">
        <span class="dash-row-label">${label}</span>
        ${idHtml}
        ${editHtml}
      </div>
    `;
  },

  /**
   * HTML string for single site card in Grid View
   */
  createCardHTML(site) {
    const docsHTML = site.docsLink
      ? `<a href="${escapeHtml(site.docsLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-docs" title="Open Docs">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Docs
         </a>`
      : `<span class="link-chip link-chip-disabled">No Docs</span>`;

    const figmaHTML = site.figmaLink
      ? `<a href="${escapeHtml(site.figmaLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-figma" title="Open Figma">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>
          Figma
         </a>`
      : `<span class="link-chip link-chip-disabled">No Figma</span>`;

    const customChipsHTML = (site.customLinks || []).map(link => {
      if (!link.url) return '';
      return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-custom" title="Open ${escapeHtml(link.label || 'Link')}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        ${escapeHtml(link.label || 'Link')}
      </a>`;
    }).join('');

    const dash2Row = this.formatDashRow(site.dashboard2Id, site.dashboard2EditUrl, '2.0');
    const dash3Row = this.formatDashRow(site.dashboard3Id, site.dashboard3EditUrl, '3.0');
    const hasDashboards = dash2Row || dash3Row;

    const dashSectionHTML = hasDashboards
      ? `<div class="dashboards-container">
          ${dash2Row}
          ${dash3Row}
         </div>`
      : '';

    return `
      <div class="site-card" id="card-${site.id}">
        <div class="site-card-header">
          <h3 class="site-title">${escapeHtml(site.siteName)}</h3>
        </div>

        <div class="site-links">
          ${docsHTML}
          ${figmaHTML}
          ${customChipsHTML}
        </div>

        ${dashSectionHTML}

        <div class="site-card-footer">
          <div class="auth-code-pill" title="${site.authCode ? 'Auth Code' : 'No Auth Code'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            ${site.authCode ? `
              <span class="mono-text auth-code-val">${escapeHtml(site.authCode)}</span>
              <button type="button" class="btn-icon-only btn-copy-auth" title="Copy Auth Code" data-auth="${escapeHtml(site.authCode)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            ` : '<span class="text-muted">No Auth Code</span>'}
          </div>

          <div class="card-actions">
            <button class="btn-icon-only btn-card-edit" title="Edit Site">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon-only btn-card-delete text-danger" title="Delete Site">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Compact dashboard formatting for Table View cells
   */
  formatTableDashCell(idText, editUrl, label) {
    if (!idText && !editUrl) return '<span class="text-muted text-sm">-</span>';

    const chipClass = label === '2.0' ? 'link-chip-dash2' : 'link-chip-dash3';

    let idHtml = '';
    if (idText) {
      if (isUrl(idText)) {
        idHtml = `<a href="${escapeHtml(idText)}" target="_blank" rel="noopener noreferrer" class="link-chip ${chipClass}" title="Open ${label} Dashboard URL">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Dashboard
        </a>`;
      } else {
        idHtml = `<span class="mono-text dash-id-badge" title="${label} Dashboard ID">${escapeHtml(idText)}</span>`;
      }
    }

    let editHtml = '';
    if (editUrl) {
      editHtml = `<a href="${escapeHtml(editUrl)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-edit" title="Edit ${label} Dashboard URL">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit
      </a>`;
    }

    return `<div class="table-chips-inline">${idHtml}${editHtml}</div>`;
  },

  /**
   * HTML string for Table View
   */
  createTableHTML(sites) {
    const rows = sites.map(site => {
      const docsHTML = site.docsLink
        ? `<a href="${escapeHtml(site.docsLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-docs" title="Open Docs">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Docs
           </a>`
        : '';

      const figmaHTML = site.figmaLink
        ? `<a href="${escapeHtml(site.figmaLink)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-figma" title="Open Figma">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>
            Figma
           </a>`
        : '';

      const customChipsHTML = (site.customLinks || []).map(link => {
        if (!link.url) return '';
        return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-chip link-chip-custom" title="Open ${escapeHtml(link.label || 'Link')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          ${escapeHtml(link.label || 'Link')}
        </a>`;
      }).join('');

      const allLinks = [docsHTML, figmaHTML, customChipsHTML].filter(Boolean).join(' ');
      const linksColumn = allLinks || `<span class="text-muted text-sm">No links</span>`;

      const dash2Cell = this.formatTableDashCell(site.dashboard2Id, site.dashboard2EditUrl, '2.0');
      const dash3Cell = this.formatTableDashCell(site.dashboard3Id, site.dashboard3EditUrl, '3.0');

      const authStatus = site.authCode
        ? `<div class="auth-code-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span class="mono-text auth-code-val">${escapeHtml(site.authCode)}</span>
            <button type="button" class="btn-icon-only btn-copy-auth" title="Copy Auth Code" data-auth="${escapeHtml(site.authCode)}">
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
              <span class="font-semibold">${escapeHtml(site.siteName)}</span>
            </div>
          </td>
          <td>
            <div class="table-links-cell">${linksColumn}</div>
          </td>
          <td>${dash2Cell}</td>
          <td>${dash3Cell}</td>
          <td>${authStatus}</td>
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
            <th>Auth Code</th>
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
