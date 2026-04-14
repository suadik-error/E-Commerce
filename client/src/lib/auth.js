import { apiGet } from "./api.js";

export const isUserRole = (role) => String(role || "").trim().toLowerCase() === "user";

export const getProfile = async () => {
  try {
    return await apiGet("/api/auth/profile");
  } catch {
    return null;
  }
};

export const getCompanyProfile = async (filters = {}) => {
  return getCompanyProfileById(filters);
};

export const getCompanyProfileById = async (filters = "") => {
  try {
    const params =
      typeof filters === "string"
        ? filters
          ? { companyId: filters }
          : undefined
        : {
            companyId: filters?.companyId,
            companySlug: filters?.companySlug,
          };

    return await apiGet("/api/auth/company-profile", params);
  } catch {
    return null;
  }
};

export const getCompanies = async () => {
  try {
    const data = await apiGet("/api/auth/companies");
    return data?.companies || [];
  } catch {
    return [];
  }
};
