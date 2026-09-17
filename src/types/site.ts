export type SiteStatus = 'Live' | 'Staging' | 'Amends' | 'Maintenance';

export type SiteColor = 'indigo' | 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';

export interface SiteEndpoints {
  dashboardUrl: string;
  editUrl: string;
  liveUrl?: string;
}

export interface SiteCredentials {
  email: string;
  password?: string;
  notes?: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type?: 'doc' | 'figma' | 'other';
}

export interface SiteEntry {
  id: string;
  name: string;
  color: SiteColor;
  status: SiteStatus;
  tags: string[];
  noFigma: boolean;
  v2: SiteEndpoints;
  v3: SiteEndpoints;
  docsUrl: string;
  figmaUrl: string;
  extraLinks?: ResourceLink[];
  credentials: SiteCredentials;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'table';
export type SortOption = 'recent' | 'name_asc' | 'name_desc' | 'status';
export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}
