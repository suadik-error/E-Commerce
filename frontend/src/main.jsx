import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const ACCESS_TOKEN_KEY = "auth_access_token";
const storedTheme = localStorage.getItem("theme") || "light";

const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const setStoredAccessToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};
const clearStoredAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

const isApiRequest = (url) => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  if (url.startsWith("/api/")) return true;
  if (API_BASE_URL && url.startsWith(`${API_BASE_URL}/api/`)) return true;
  return false;
};

const nativeFetch = window.fetch.bind(window);

window.fetch = async (input, init = {}) => {
  const requestUrl = typeof input === "string" ? input : input?.url;
  const token = getStoredAccessToken();
  const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined) || {});

  if (token && isApiRequest(requestUrl) && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await nativeFetch(input, {
    ...init,
    headers,
  });

  if (requestUrl?.includes("/api/auth/logout") && response.ok) {
    clearStoredAccessToken();
  }

  return response;
};

axios.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token && isApiRequest(config.url)) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (response.config?.url?.includes("/api/auth/logout")) {
      clearStoredAccessToken();
    }
    return response;
  },
  (error) => Promise.reject(error)
);

window.addEventListener("auth:token", (event) => {
  setStoredAccessToken(event.detail?.accessToken);
});

window.addEventListener("auth:clear", clearStoredAccessToken);

document.documentElement.setAttribute("data-theme", storedTheme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
