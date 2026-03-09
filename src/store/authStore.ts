import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_ID_KEY = 'auth_user_id';

interface AuthState {
  userId: string | null;
  token: string | null;
  profileRefreshKey: number;
  needsOnboarding: boolean | null;
  onboardingResolved: boolean;
  needsCompleteProfile: boolean;
  isSessionCleared: boolean;
  setUserId: (id: string) => void;
  setToken: (token: string) => void;
  setSession: (session: { userId: string; token: string; needsOnboarding: boolean }) => Promise<void>;
  setNeedsOnboarding: (value: boolean) => void;
  setOnboardingResolved: (value: boolean) => void;
  setNeedsCompleteProfile: (value: boolean) => void;
  markProfileAsComplete: () => void;
  triggerProfileRefresh: () => void;
  hydrateSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  profileRefreshKey: 0,
  needsOnboarding: null,
  onboardingResolved: false,
  needsCompleteProfile: false,
  isSessionCleared: false,
  
  setUserId: (id: string) => {
    set({ userId: id });
  },
  
  setToken: (token: string) => {
    set({ token });
  },

  setSession: async ({ userId, token, needsOnboarding }) => {
    set({
      userId,
      token,
      needsOnboarding,
      onboardingResolved: true,
      isSessionCleared: false,
    });
    await SecureStore.setItemAsync(AUTH_USER_ID_KEY, userId);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },

  setNeedsOnboarding: (value: boolean) => {
    set({ needsOnboarding: value });
  },

  setOnboardingResolved: (value: boolean) => {
    set({ onboardingResolved: value });
  },
  
  setNeedsCompleteProfile: (value: boolean) => {
    set({ needsCompleteProfile: value });
  },
  
  markProfileAsComplete: () => {
    set({ needsCompleteProfile: false });
  },

  triggerProfileRefresh: () => {
    set((state) => ({ profileRefreshKey: state.profileRefreshKey + 1 }));
  },

  hydrateSession: async () => {
    if (useAuthStore.getState().isSessionCleared) {
      console.log('[authStore] Rehidratacion omitida por cierre de sesion manual.');
      return;
    }

    let storedToken: string | null = null;
    let storedUserId: string | null = null;

    try {
      storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      storedUserId = await SecureStore.getItemAsync(AUTH_USER_ID_KEY);
    } catch (error) {
      console.error('[authStore] Error leyendo SecureStore:', error);
      set({
        userId: null,
        token: null,
        needsOnboarding: null,
        onboardingResolved: false,
      });
      return;
    }

    if (storedToken && storedUserId) {
      // Keep onboarding unresolved until backend status endpoint confirms it.
      set({
        token: storedToken,
        userId: storedUserId,
        needsOnboarding: null,
        onboardingResolved: false,
        isSessionCleared: false,
      });
      console.log('[authStore] ✓ Sesion restaurada desde SecureStore');
      return;
    }

    console.log('[authStore] No existe sesion persistida. Usuario debe iniciar sesion.');
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(AUTH_USER_ID_KEY);
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    set({
      userId: null,
      token: null,
      profileRefreshKey: 0,
      needsOnboarding: null,
      onboardingResolved: false,
      needsCompleteProfile: false,
      isSessionCleared: true,
    });
    console.log('[authStore] Sesion limpiada.');
  },
}));
