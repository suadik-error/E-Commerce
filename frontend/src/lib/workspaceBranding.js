export const DEFAULT_PRIMARY_COLOR = "#12b76a";
export const DEFAULT_ACCENT_COLOR = "#3154ff";
export const DEFAULT_SIDEBAR_PLACEMENT = "left";
export const DEFAULT_NAVBAR_PLACEMENT = "top";

const cleanHex = (value, fallback) => {
  const normalized = String(value || "").trim();
  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
};

export const getWorkspaceInitials = (profile) => {
  const source = String(
    profile?.companyName || profile?.businessName || profile?.name || "BT"
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return source || "BT";
};

export const getWorkspaceBranding = (profile) => ({
  companyName: String(profile?.companyName || profile?.businessName || "Busi-Tech").trim(),
  companyLogo: String(profile?.companyLogo || "").trim(),
  primaryColor: cleanHex(profile?.primaryColor, DEFAULT_PRIMARY_COLOR),
  accentColor: cleanHex(profile?.accentColor, DEFAULT_ACCENT_COLOR),
  sidebarPlacement:
    profile?.sidebarPlacement === "right" ? "right" : DEFAULT_SIDEBAR_PLACEMENT,
  navbarPlacement:
    profile?.navbarPlacement === "bottom" ? "bottom" : DEFAULT_NAVBAR_PLACEMENT,
});

export const applyWorkspaceAppearance = (profile) => {
  if (typeof document === "undefined") return;

  const branding = getWorkspaceBranding(profile);
  const root = document.documentElement;

  root.style.setProperty("--workspace-primary", branding.primaryColor);
  root.style.setProperty("--workspace-accent", branding.accentColor);
  root.setAttribute("data-sidebar-placement", branding.sidebarPlacement);
  root.setAttribute("data-navbar-placement", branding.navbarPlacement);

  if (profile?.theme) {
    root.setAttribute("data-theme", profile.theme);
    localStorage.setItem("theme", profile.theme);
  }
};
