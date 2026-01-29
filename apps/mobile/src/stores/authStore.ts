import { create } from 'zustand';
import { storage } from '../utils/storage';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string } | null;
  selectedHouseholdId: string | null;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: { id: string; email: string } | null) => void;
  setSelectedHouseholdId: (id: string | null) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  selectedHouseholdId: null,
  async setTokens(accessToken, refreshToken) {
    await storage.setAccessToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    set({ accessToken, refreshToken });
  },
  setUser(user) {
    set({ user });
  },
  async setSelectedHouseholdId(id) {
    if (id) {
      await storage.setSelectedHousehold(id);
    } else {
      await storage.clearSelectedHousehold();
    }
    set({ selectedHouseholdId: id });
  },
  async hydrate() {
    const [accessToken, refreshToken, selectedHouseholdId] = await Promise.all([
      storage.getAccessToken(),
      storage.getRefreshToken(),
      storage.getSelectedHousehold(),
    ]);
    set({ accessToken, refreshToken, selectedHouseholdId });
  },
  async logout() {
    await storage.clearTokens();
    await storage.clearSelectedHousehold();
    set({ accessToken: null, refreshToken: null, user: null, selectedHouseholdId: null });
  },
}));
