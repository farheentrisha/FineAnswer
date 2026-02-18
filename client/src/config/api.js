/**
 * API Configuration
 * 
 * Uses environment variable VITE_API_URL if set, otherwise defaults:
 * - Development: http://localhost:5000
 * - Production: Set VITE_API_URL in your hosting platform (Vercel/Netlify)
 * 
 * This file should NOT be modified between branches to avoid merge conflicts.
 * Use environment variables instead!
 */
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string") {
    const url = envUrl.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace(/\/$/, "");
    }
    return `https://${url}`.replace(/\/$/, "");
  }
  // Default: localhost for dev, production should set VITE_API_URL
  return import.meta.env.DEV 
    ? "http://localhost:5000"
    : "https://fine-answer.vercel.app";
};
export const API_BASE = getApiBaseUrl();
export const API_BASE_URL = `${API_BASE}/api`;
