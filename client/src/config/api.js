const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://fine-answer.vercel.app";   

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
