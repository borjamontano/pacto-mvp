import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'pacto_access_token';
const REFRESH_TOKEN_KEY = 'pacto_refresh_token';
const HOUSEHOLD_KEY = 'pacto_household';

export const storage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async setAccessToken(token: string) {
    return AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string) {
    return AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  async clearTokens() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  async setSelectedHousehold(id: string) {
    return AsyncStorage.setItem(HOUSEHOLD_KEY, id);
  },
  async getSelectedHousehold() {
    return AsyncStorage.getItem(HOUSEHOLD_KEY);
  },
  async clearSelectedHousehold() {
    return AsyncStorage.removeItem(HOUSEHOLD_KEY);
  },
};
