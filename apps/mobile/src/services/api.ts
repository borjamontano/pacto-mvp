import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';
import { useAuthStore } from '../stores/authStore';

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    const currentRefreshToken = await storage.getRefreshToken();
    if (!currentRefreshToken) return null;
    try {
      const response = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
        refreshToken: currentRefreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      await storage.setAccessToken(accessToken);
      await storage.setRefreshToken(newRefreshToken);
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      await useAuthStore.getState().logout();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);

export type AuthResponse = {
  user: { id: string; email: string; name?: string };
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  register: (payload: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload),
  me: () => api.get<{ id: string; email: string }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const householdApi = {
  list: () => api.get('/households'),
  create: (payload: { name: string }) => api.post('/households', payload),
  join: (payload: { inviteCode: string }) => api.post('/households/join', payload),
  invite: (id: string) => api.post(`/households/${id}/invite`),
};

export const pactsApi = {
  list: (householdId: string, filter: string) =>
    api.get(`/households/${householdId}/pacts`, { params: { filter } }),
  get: (householdId: string, pactId: string) =>
    api.get(`/households/${householdId}/pacts/${pactId}`),
  create: (householdId: string, payload: Record<string, unknown>) =>
    api.post(`/households/${householdId}/pacts`, payload),
  update: (householdId: string, pactId: string, payload: Record<string, unknown>) =>
    api.patch(`/households/${householdId}/pacts/${pactId}`, payload),
  remove: (householdId: string, pactId: string) =>
    api.delete(`/households/${householdId}/pacts/${pactId}`),
  assignToMe: (householdId: string, pactId: string) =>
    api.post(`/households/${householdId}/pacts/${pactId}/assign-to-me`),
  markDone: (householdId: string, pactId: string) =>
    api.post(`/households/${householdId}/pacts/${pactId}/mark-done`),
  confirm: (householdId: string, pactId: string) =>
    api.post(`/households/${householdId}/pacts/${pactId}/confirm`),
};

export const activityApi = {
  list: (householdId: string, cursor?: string) =>
    api.get(`/households/${householdId}/activity`, { params: { cursor } }),
};

export const devicesApi = {
  register: (payload: { expoPushToken: string; platform: 'ios' | 'android' }) =>
    api.post('/devices/register-token', payload),
  unregister: () => api.delete('/devices/unregister-token'),
};
