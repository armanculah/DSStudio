const runtimeWindow = typeof window !== "undefined" ? window : undefined;

const ENV_API_ORIGIN =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_API_ORIGIN
    : undefined;

const DEFAULT_PROTOCOL =
  ENV_API_ORIGIN?.split("://")[0] ??
  (runtimeWindow?.location?.protocol || "http:");

const DEFAULT_HOST = runtimeWindow?.location?.hostname || "localhost";
const DEFAULT_PORT =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_PORT) ||
  "8000";

const resolvedOrigin =
  ENV_API_ORIGIN ||
  (runtimeWindow?.location?.origin
    ? runtimeWindow.location.origin
    : `${DEFAULT_PROTOCOL}//${DEFAULT_HOST}:${DEFAULT_PORT}`.replace(/\/$/, ""));

export const API_ORIGIN = resolvedOrigin;
export const API_BASE = `${API_ORIGIN}/api/v1`;
export const AUTH_BASE = `${API_BASE}/auth`;
export const PROFILE_BASE = `${API_BASE}/profile`;
