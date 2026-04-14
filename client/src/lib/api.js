const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const buildUrl = (path, params) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, value);
  });

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
};

export async function apiRequest(path, options = {}, params) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, params), {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    Object.assign(error, data);
    throw error;
  }

  return data;
}

export const apiGet = (path, params) => apiRequest(path, {}, params);

export const apiPost = (path, body) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
