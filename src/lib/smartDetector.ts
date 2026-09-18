import { SiteColor, SiteStatus, SiteEntry, ResourceLink } from '@/types/site';
import { QUICK_MENU_PALETTE, getQuickMenuColor } from './storage';

export interface DetectedSiteData {
  name: string;
  color: SiteColor;
  status: SiteStatus;
  tags: string[];
  v2: {
    dashboardUrl: string;
    editUrl: string;
    liveUrl: string;
  };
  v3: {
    dashboardUrl: string;
    editUrl: string;
    liveUrl: string;
  };
  docsUrl: string;
  figmaUrl: string;
  extraLinks: ResourceLink[];
  credentials: {
    email: string;
    password: string;
    notes: string;
  };
  rawMatchesCount: number;
}

const COLOR_PALETTE: SiteColor[] = QUICK_MENU_PALETTE;

/**
 * Derives a human-readable clean name from a hostname/domain.
 * e.g. "v3.eylea-loveeysight.hk" -> "Eylea Loveeysight HK"
 * e.g. "radiology-hk.med.portal" -> "Radiology HK"
 */
export function deriveNameFromDomain(domain: string): string {
  let clean = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
  // strip path and query
  clean = clean.split('/')[0].split(':')[0];

  // strip known common prefixes like v2., v3., dev., stage., staging., test., prod., app., cms.
  clean = clean.replace(/^(v2|v3|dev|stage|staging|test|prod|portal|dashboard|cms|app|admin)\./g, '');

  // strip known TLDs or generic extensions
  clean = clean.replace(/\.(com|org|net|io|co|hk|uk|us|de|fr|med|portal|pl|ar|app|site|dev|global)$/g, '');
  clean = clean.replace(/\.(portal|med|health|pharma)$/g, '');

  // split by dot, dash, underscore
  const parts = clean.split(/[-_.]+/).filter((p) => p.length > 0 && !['v2', 'v3', 'cms', 'edit'].includes(p));

  if (parts.length === 0) return 'Untitled Site';

  return parts
    .map((word) => {
      // Keep acronyms uppercase (e.g. hk, us, uk, nxg, api)
      if (['hk', 'us', 'uk', 'eu', 'nxg', 'med', 'api', 'id'].includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Parses raw text containing URLs, credentials, and notes for a single site entry.
 */
export function parseSingleSiteDump(text: string, siteIndex?: number, explicitColor?: SiteColor): DetectedSiteData {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let detectedName = '';
  let color: SiteColor = explicitColor || (siteIndex !== undefined ? getQuickMenuColor(siteIndex) : 'indigo');
  let status: SiteStatus = 'Live';
  const detectedTags: Set<string> = new Set();

  let v2Dashboard = '';
  let v2Edit = '';
  let v2Live = '';

  let v3Dashboard = '';
  let v3Edit = '';
  let v3Live = '';

  let docsUrl = '';
  let figmaUrl = '';
  const extraLinks: ResourceLink[] = [];

  let email = '';
  let password = '';
  const notesLines: string[] = [];

  let matchCount = 0;

  // Regex helpers
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

  const foundUrls: { url: string; lineLabel: string }[] = [];

  // Pass 1: Line-by-line inspection for labeled items & content
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for explicit site/client name
    if (/^(site|client|name|project|title|vault)(\s*name)?\s*[:=-]\s*(.+)$/i.test(line)) {
      const match = line.match(/^(site|client|name|project|title|vault)(\s*name)?\s*[:=-]\s*(.+)$/i);
      if (match && match[3] && !detectedName) {
        detectedName = match[3].trim().replace(/^["'`]|["'`]$/g, '');
        matchCount++;
        continue;
      }
    }

    // Check for explicit status
    if (/(status|deploy)\s*[:=-]\s*(live|staging|amends|maintenance)/i.test(line)) {
      const match = line.match(/(status|deploy)\s*[:=-]\s*(live|staging|amends|maintenance)/i);
      if (match && match[2]) {
        const val = match[2].toLowerCase();
        if (val === 'live') status = 'Live';
        else if (val === 'staging') status = 'Staging';
        else if (val === 'amends') status = 'Amends';
        else if (val === 'maintenance') status = 'Maintenance';
      }
    }

    // Check for email
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !email) {
      email = emailMatch[1];
      matchCount++;
    }

    // Check for password / credentials
    if (/^(pass(word)?|pwd|secret|auth|login pass)\s*[:=-]\s*(.+)$/i.test(line)) {
      const match = line.match(/^(pass(word)?|pwd|secret|auth|login pass)\s*[:=-]\s*(.+)$/i);
      if (match && match[3] && !password) {
        password = match[3].trim();
        matchCount++;
        continue;
      }
    }

    // Check for notes or tokens
    if (/^(notes?|info|memo|key|token|ip whitelist|vpn|staging key)\s*[:=-]\s*(.+)$/i.test(line)) {
      const match = line.match(/^(notes?|info|memo|key|token|ip whitelist|vpn|staging key)\s*[:=-]\s*(.+)$/i);
      if (match && match[2]) {
        notesLines.push(match[2].trim());
        matchCount++;
        continue;
      }
    }

    // Extract all URLs on this line
    const urlsOnLine = line.match(urlRegex);
    if (urlsOnLine) {
      for (const u of urlsOnLine) {
        foundUrls.push({ url: u.trim().replace(/[.,;)]+$/, ''), lineLabel: lowerLine });
      }
    } else {
      // If line is not a URL, not an email, and not labeled, check if it could be a site name or notes
      if (!detectedName && lines.indexOf(line) === 0 && !lowerLine.includes('http') && line.length < 60 && !emailMatch) {
        detectedName = line.replace(/^#+\s*/, '').trim();
        matchCount++;
      } else if (!emailMatch && !/pass(word)?/i.test(line) && line.length > 5 && !line.startsWith('---')) {
        // Collect as potential note if it looks like instructions
        if (lowerLine.includes('key') || lowerLine.includes('token') || lowerLine.includes('vpn') || lowerLine.includes('access') || lowerLine.includes('login')) {
          notesLines.push(line);
        }
      }
    }
  }

  // Pass 2: Categorize each extracted URL
  const unassignedV2Urls: string[] = [];
  const unassignedV3Urls: string[] = [];
  const unassignedGenericUrls: string[] = [];

  for (const { url, lineLabel } of foundUrls) {
    matchCount++;
    const lowerUrl = url.toLowerCase();

    // Figma detection
    if (lowerUrl.includes('figma.com')) {
      if (!figmaUrl) {
        figmaUrl = url;
      } else {
        const count = extraLinks.filter((l) => l.type === 'figma').length + 2;
        const title = lineLabel
          ? lineLabel.charAt(0).toUpperCase() + lineLabel.slice(1)
          : `Figma Specs ${count}`;
        extraLinks.push({
          id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          url,
          type: 'figma',
        });
      }
      detectedTags.add('Figma');
      continue;
    }

    // Docs / Specs detection
    if (
      lowerUrl.includes('docs.google.com') ||
      lowerUrl.includes('notion.so') ||
      lowerUrl.includes('notion.site') ||
      lowerUrl.includes('confluence') ||
      lowerUrl.includes('/wiki') ||
      lowerUrl.includes('/spec') ||
      lowerUrl.includes('/docs') ||
      lineLabel.includes('doc') ||
      lineLabel.includes('spec')
    ) {
      if (!docsUrl) {
        docsUrl = url;
      } else {
        const count = extraLinks.filter((l) => l.type === 'doc').length + 2;
        const title = lineLabel
          ? lineLabel.charAt(0).toUpperCase() + lineLabel.slice(1)
          : `Doc Resource ${count}`;
        extraLinks.push({
          id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          url,
          type: 'doc',
        });
      }
      detectedTags.add('Docs');
      continue;
    }

    // Version 2.0 URLs
    const isV2 = 
      lineLabel.includes('2.0') || 
      lineLabel.includes('v2') || 
      lowerUrl.includes('/v2') || 
      lowerUrl.includes('v2.') || 
      lowerUrl.includes('legacy');

    // Version 3.0 URLs
    const isV3 = 
      lineLabel.includes('3.0') || 
      lineLabel.includes('v3') || 
      lowerUrl.includes('/v3') || 
      lowerUrl.includes('v3.') || 
      lowerUrl.includes('next');

    if (isV2) {
      if ((lineLabel.includes('dash') || lowerUrl.includes('dash') || lowerUrl.includes('admin') || lowerUrl.includes('portal') || lowerUrl.includes('console')) && !v2Dashboard) {
        v2Dashboard = url;
      } else if ((lineLabel.includes('edit') || lineLabel.includes('cms') || lowerUrl.includes('edit') || lowerUrl.includes('cms') || lowerUrl.includes('studio') || lowerUrl.includes('author')) && !v2Edit) {
        v2Edit = url;
      } else if ((lineLabel.includes('live') || lineLabel.includes('prod') || lowerUrl.includes('live')) && !v2Live) {
        v2Live = url;
      } else {
        unassignedV2Urls.push(url);
      }
      continue;
    }

    if (isV3) {
      if ((lineLabel.includes('dash') || lowerUrl.includes('dash') || lowerUrl.includes('admin') || lowerUrl.includes('portal') || lowerUrl.includes('console')) && !v3Dashboard) {
        v3Dashboard = url;
      } else if ((lineLabel.includes('edit') || lineLabel.includes('cms') || lowerUrl.includes('edit') || lowerUrl.includes('cms') || lowerUrl.includes('studio') || lowerUrl.includes('author')) && !v3Edit) {
        v3Edit = url;
      } else if ((lineLabel.includes('live') || lineLabel.includes('prod') || lowerUrl.includes('live')) && !v3Live) {
        v3Live = url;
      } else {
        unassignedV3Urls.push(url);
      }
      continue;
    }

    // Generic URLs (not explicitly labeled as v2 or v3)
    if (lineLabel.includes('edit') || lineLabel.includes('cms') || lowerUrl.includes('/edit') || lowerUrl.includes('/cms')) {
      if (!v3Edit) v3Edit = url;
      else if (!v2Edit) v2Edit = url;
      else unassignedGenericUrls.push(url);
    } else if (lineLabel.includes('dash') || lowerUrl.includes('dash') || lowerUrl.includes('portal') || lowerUrl.includes('admin')) {
      if (!v3Dashboard) v3Dashboard = url;
      else if (!v2Dashboard) v2Dashboard = url;
      else unassignedGenericUrls.push(url);
    } else {
      unassignedGenericUrls.push(url);
    }
  }

  // Pass 3: Fill empty slots from unassigned URLs
  for (const url of unassignedV2Urls) {
    if (!v2Dashboard) v2Dashboard = url;
    else if (!v2Edit) v2Edit = url;
    else if (!v2Live) v2Live = url;
  }

  for (const url of unassignedV3Urls) {
    if (!v3Dashboard) v3Dashboard = url;
    else if (!v3Edit) v3Edit = url;
    else if (!v3Live) v3Live = url;
  }

  for (const url of unassignedGenericUrls) {
    if (!v3Live && (v3Dashboard || v3Edit)) {
      v3Live = url;
    } else if (!v2Live && (v2Dashboard || v2Edit)) {
      v2Live = url;
    } else if (!v3Dashboard) {
      v3Dashboard = url;
    } else if (!v3Live) {
      v3Live = url;
    } else if (!v2Dashboard) {
      v2Dashboard = url;
    }
  }

  // Derive site name from domain if none found
  if (!detectedName) {
    const candidateUrl = v3Dashboard || v3Live || v2Dashboard || v2Live || v3Edit || v2Edit || (foundUrls[0]?.url);
    if (candidateUrl) {
      try {
        const parsed = new URL(candidateUrl);
        detectedName = deriveNameFromDomain(parsed.hostname);
      } catch (e) {
        detectedName = 'New Detected Site';
      }
    } else {
      detectedName = 'New Vault Entry';
    }
  }

  // Assign harmonic badge color based on quick menu palette
  if (explicitColor) {
    color = explicitColor;
  } else if (siteIndex !== undefined) {
    color = getQuickMenuColor(siteIndex);
  } else {
    let hash = 0;
    for (let i = 0; i < detectedName.length; i++) {
      hash = (hash << 5) - hash + detectedName.charCodeAt(i);
      hash |= 0;
    }
    color = COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
  }

  // Add version tags
  if (v3Dashboard || v3Edit || v3Live) {
    detectedTags.add('3.0 Next-Gen');
  }
  if (v2Dashboard || v2Edit || v2Live) {
    detectedTags.add('2.0 Legacy');
  }

  return {
    name: detectedName,
    color,
    status,
    tags: Array.from(detectedTags),
    v2: {
      dashboardUrl: v2Dashboard,
      editUrl: v2Edit,
      liveUrl: v2Live,
    },
    v3: {
      dashboardUrl: v3Dashboard,
      editUrl: v3Edit,
      liveUrl: v3Live,
    },
    docsUrl,
    figmaUrl,
    extraLinks,
    credentials: {
      email,
      password,
      notes: notesLines.join('\n'),
    },
    rawMatchesCount: matchCount,
  };
}

/**
 * Detects whether the input contains multiple sites (e.g. separated by "---",
 * multiple "Site:" headers, or distinct blank line sections with different domains).
 */
export function parseSmartLinkDump(text: string, startIndex = 0): DetectedSiteData[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Check for explicit multi-site delimiter lines
  if (trimmed.includes('---') || trimmed.includes('===') || /^(site|client)\s*\d*\s*[:=-]/im.test(trimmed)) {
    const rawChunks = trimmed.split(/(?:^|\n)(?:[-=]{3,}|(?:Site|Client)\s*\d*\s*[:=-])/i).filter(Boolean);
    if (rawChunks.length > 1) {
      const results: DetectedSiteData[] = [];
      for (let i = 0; i < rawChunks.length; i++) {
        const parsed = parseSingleSiteDump(rawChunks[i], startIndex + i);
        if (parsed.rawMatchesCount > 0 || parsed.name !== 'New Vault Entry') {
          results.push(parsed);
        }
      }
      if (results.length > 0) return results;
    }
  }

  // Check for double-newline sections that have distinct URLs
  const doubleNewlineSections = trimmed.split(/\n\s*\n+/).filter((s) => s.trim().length > 0);
  if (doubleNewlineSections.length > 1) {
    const potentialSites = doubleNewlineSections.map((sec, i) => parseSingleSiteDump(sec, startIndex + i));
    // If multiple sections each have at least 1 URL or name
    const validSections = potentialSites.filter((p) => p.rawMatchesCount >= 2);
    if (validSections.length > 1) {
      return validSections;
    }
  }

  // Default: single site
  return [parseSingleSiteDump(trimmed, startIndex)];
}
