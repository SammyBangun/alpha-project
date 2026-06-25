// Auth session state — tokens + user, persisted to localStorage (user choice: Bearer flow).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, PublicUser } from "./types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: PublicUser | null;
  hydrated: boolean;
  setSession: (s: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "alpha-auth",
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** Non-reactive snapshot access for the fetch client (outside React). */
export const authStore = {
  get: () => useAuthStore.getState(),
};

export function isAuthenticated(): boolean {
  return !!useAuthStore.getState().accessToken;
}
