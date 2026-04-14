const SELECTED_COMPANY_KEY = "selected_company_id";

export const getSelectedCompanyId = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SELECTED_COMPANY_KEY) || "";
};

export const setSelectedCompanyId = (companyId) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_COMPANY_KEY, companyId);
  window.dispatchEvent(new CustomEvent("company:selected", { detail: { companyId } }));
};

export const clearSelectedCompanyId = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SELECTED_COMPANY_KEY);
  window.dispatchEvent(new CustomEvent("company:selected", { detail: { companyId: "" } }));
};
