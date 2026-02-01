/**
 * Central API Base URL - Update this ONE place to change backend for entire app.
 *
 * - Local dev: http://localhost:5000
 * - Production: https://your-backend.vercel.app (or your backend URL)
 *
 * VITE_API_URL env variable (set in Vercel) overrides this when defined.
 */

// Update this single value to switch between local and production backend
// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://fine-answer.vercel.app"; // Uncomment for production backend

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string") {
    const url = envUrl.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace(/\/$/, "");
    }
    return `https://${url}`.replace(/\/$/, "");
  }
  return BASE_URL.replace(/\/$/, "");
};

export const API_BASE = getApiBaseUrl();
export const API_BASE_URL = `${API_BASE}/api`;
