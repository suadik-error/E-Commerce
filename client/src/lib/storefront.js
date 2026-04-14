export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const getCompanyInitials = (company) =>
  String(company?.companyName || company?.name || "CO")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CO";

export const applyStorefrontTheme = (company) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--store-primary", company?.primaryColor || "#0f766e");
  root.style.setProperty("--store-accent", company?.accentColor || "#f97316");
  root.setAttribute("data-store-layout", company?.storefrontLayout || "editorial");
  root.setAttribute("data-store-card-style", company?.storefrontCardStyle || "soft");
};

export const resetStorefrontTheme = () => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.removeProperty("--store-primary");
  root.style.removeProperty("--store-accent");
  root.removeAttribute("data-store-layout");
  root.removeAttribute("data-store-card-style");
};

export const getStorePath = (companyId) => `/companies/${companyId}/store`;
