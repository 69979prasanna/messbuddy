

const normalizeApiUrl = () => {
  let url = process.env.REACT_APP_APIKEY;
  let ip = process.env.REACT_APP_IP;
  if (!url || !url.trim()) {
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      (!ip || window.location.hostname !== `${ip}`)
    ) {
      url = "https://messbuddy-api.onrender.com/api";
    } else {
      url = "http://localhost:5000/api";
    }
  }

  const clean = url.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const normalizeAuthUrl = () => {
  const authUrl = process.env.REACT_APP_AUTH;

  if (authUrl && authUrl.trim()) {
    const clean = authUrl.trim().replace(/\/+$/, "");
    if (clean.endsWith("/api/auth")) {
      return clean;
    }
    if (clean.endsWith("/auth")) {
      const base = clean.slice(0, -5).replace(/\/+$/, "");
      return base.endsWith("/api") ? clean : `${base}/api/auth`;
    }
    return clean.endsWith("/api") ? `${clean}/auth` : `${clean}/api/auth`;
  }

  return `${normalizeApiUrl()}/auth`;
};

export const API = normalizeApiUrl();
export const AUTH_API = normalizeAuthUrl();

export default API;
