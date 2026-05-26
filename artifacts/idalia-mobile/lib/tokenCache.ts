import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === "web") {
        if (typeof window === "undefined") return null;
        return window.localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") window.localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  async clearToken(key: string) {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") window.localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
