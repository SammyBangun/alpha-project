// Sidebar module list. Only system + metrics are wired this step; the rest render disabled.
export interface NavItem {
  id: string;
  code: string;
  label: string;
  href: string;
  enabled: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "core", code: "01", label: "Alpha Core", href: "/core", enabled: false },
  { id: "system", code: "02", label: "Daily Engine", href: "/system", enabled: true },
  { id: "metrics", code: "03", label: "Metrics", href: "/metrics", enabled: true },
  { id: "feedback", code: "04", label: "Weekly Reset", href: "/feedback", enabled: false },
  { id: "progression", code: "05", label: "Progression", href: "/progression", enabled: false },
  { id: "antifail", code: "06", label: "Anti-Failure", href: "/antifail", enabled: false },
  { id: "environment", code: "07", label: "Environment", href: "/environment", enabled: false },
  { id: "oath", code: "08", label: "The Oath", href: "/oath", enabled: false },
];

/** Topbar code + title per route id. */
export const PAGE_TITLES: Record<string, [code: string, title: string]> = {
  system: ["ALPHA SYSTEM", "Daily Command Center"],
  metrics: ["ALPHA METRICS", "Tracking System"],
};
