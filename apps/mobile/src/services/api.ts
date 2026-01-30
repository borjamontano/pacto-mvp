// apps/mobile/src/services/api.ts

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn(
    "Missing EXPO_PUBLIC_API_URL. Did you set it in apps/mobile/.env ?"
  );
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  retry = true
): Promise<T> {
  const url = `${baseURL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // ✅ if unauthorized, try refresh token once
  if (res.status === 401 && retry && refreshToken) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request<T>(method, path, body, false);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // no content
  if (res.status === 204) return undefined as T;

  return res.json();
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${baseURL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    // asumimos que devuelve esto:
    // { accessToken: "...", refreshToken: "..." }
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>("/auth/login", body),

  register: (body: { email: string; password: string; name: string }) =>
    api.post<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>("/auth/register", body),

  refresh: (body: { refreshToken: string }) =>
    api.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", body),
};

export const householdApi = {
  create: (body: { name: string }) =>
    api.post('/households', body),

  list: () =>
    api.get('/households'),

  getById: (id: string) =>
    api.get(`/households/${id}`),

  invite: (id: string) =>
    api.post(`/households/${id}/invite`),
};


