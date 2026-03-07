import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_ID_KEY = 'auth_user_id';

interface AuthState {
  userId: string | null;
  token: string | null;
  needsCompleteProfile: boolean;
  isSessionCleared: boolean;
  setUserId: (id: string) => void;
  setToken: (token: string) => void;
  setSession: (session: { userId: string; token: string }) => Promise<void>;
  setNeedsCompleteProfile: (value: boolean) => void;
  markProfileAsComplete: () => void;
  hydrateSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  needsCompleteProfile: false,
  isSessionCleared: false,
  
  setUserId: (id: string) => {
    set({ userId: id });
  },
  
  setToken: (token: string) => {
    set({ token });
  },

  setSession: async ({ userId, token }) => {
    set({ userId, token, isSessionCleared: false });
    await SecureStore.setItemAsync(AUTH_USER_ID_KEY, userId);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },
  
  setNeedsCompleteProfile: (value: boolean) => {
    set({ needsCompleteProfile: value });
  },
  
  markProfileAsComplete: () => {
    set({ needsCompleteProfile: false });
  },

  hydrateSession: async () => {
    if (useAuthStore.getState().isSessionCleared) {
      console.log('[authStore] Rehidratacion omitida por cierre de sesion manual.');
      return;
    }

    const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    const storedUserId = await SecureStore.getItemAsync(AUTH_USER_ID_KEY);

    if (storedToken && storedUserId) {
      set({ token: storedToken, userId: storedUserId, isSessionCleared: false });
      console.log('[authStore] ✓ Sesion restaurada desde SecureStore');
      return;
    }

    console.log('[authStore] No existe sesion persistida. Usuario debe iniciar sesion.');
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(AUTH_USER_ID_KEY);
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    set({ userId: null, token: null, needsCompleteProfile: false, isSessionCleared: true });
    console.log('[authStore] Sesion limpiada.');
  },
}));
