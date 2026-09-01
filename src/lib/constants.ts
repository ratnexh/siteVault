import { SiteEntry } from '@/types/site';

export const DEFAULT_SITES: SiteEntry[] = [
  {
    id: "site_1",
    name: "Radiology Hong Kong",
    color: "blue",
    status: "Live",
    tags: ["Docs"],
    noFigma: true,
    v2: {
      dashboardUrl: "",
      editUrl: ""
    },
    v3: {
      dashboardUrl: "https://v3.radiology-hk.med.portal/dashboard",
      editUrl: "https://v3.radiology-hk.med.portal/cms/edit"
    },
    docsUrl: "https://docs.google.com/document/d/radiology-hk-specs",
    figmaUrl: "",
    credentials: {
      email: "test_hk_prod1@yopmail.com",
      password: "Space2026!test1234",
      notes: "Space2026! key required for staging tunnel access."
    },
    updatedAt: "2026-08-28T10:30:00Z"
  },
  {
    id: "site_2",
    name: "Eylea Loveeysight HK",
    color: "indigo",
    status: "Live",
    tags: ["Docs", "Figma", "Docs copy editable"],
    noFigma: false,
    v2: {
      dashboardUrl: "https://v2.eylea-loveeysight.hk/dashboard",
      editUrl: ""
    },
    v3: {
      dashboardUrl: "https://v3.eylea-loveeysight.hk/dashboard",
      editUrl: "https://v3.eylea-loveeysight.hk/edit"
    },
    docsUrl: "https://docs.google.com/document/d/eylea-hk-master",
    figmaUrl: "https://figma.com/file/eylea-loveeysight-design",
    credentials: {
      email: "eylea_admin@bayer.global",
      password: "EyleaSecure!2026#",
      notes: "Dual approval needed for production translations."
    },
    updatedAt: "2026-08-30T14:15:00Z"
  },
  {
    id: "site_3",
    name: "Pacientes Argentina NXG",
    color: "purple",
    status: "Staging",
    tags: ["Docs"],
    noFigma: true,
    v2: {
      dashboardUrl: "",
      editUrl: ""
    },
    v3: {
      dashboardUrl: "https://v3.pacientes-ar.nxg-health.org/portal",
      editUrl: "https://v3.pacientes-ar.nxg-health.org/admin/content"
    },
    docsUrl: "https://docs.google.com/document/d/pacientes-ar-handover",
    figmaUrl: "",
    credentials: {
      email: "editor_ar@pacientes-nxg.org",
      password: "ArgPat2026!Vault",
      notes: "Region proxy: Buenos Aires cluster (AWS sa-east-1)"
    },
    updatedAt: "2026-08-29T08:45:00Z"
  },
  {
    id: "site_4",
    name: "Poland NXG",
    color: "emerald",
    status: "Amends",
    tags: ["Docs", "Amends"],
    noFigma: true,
    v2: {
      dashboardUrl: "https://v2.poland-nxg.pharma.pl/analytics",
      editUrl: "https://v2.poland-nxg.pharma.pl/wp-admin"
    },
    v3: {
      dashboardUrl: "https://v3.poland-nxg.pharma.pl/dashboard",
      editUrl: "https://v3.poland-nxg.pharma.pl/edit"
    },
    docsUrl: "https://docs.google.com/document/d/poland-nxg-brief",
    figmaUrl: "",
    credentials: {
      email: "poland_lead@nxg-pharma.pl",
      password: "WarsawNXG#2026!",
      notes: "GDPR strict mode active. Polish characters supported."
    },
    updatedAt: "2026-08-31T11:00:00Z"
  }
];
