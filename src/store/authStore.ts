import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  token: string | null;
  needsCompleteProfile: boolean;
  setUserId: (id: string) => void;
  setToken: (token: string) => void;
  setNeedsCompleteProfile: (value: boolean) => void;
  markProfileAsComplete: () => void;
  initializeFromEnv: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  needsCompleteProfile: false,
  
  setUserId: (id: string) => {
    set({ userId: id });
  },
  
  setToken: (token: string) => {
    set({ token });
  },
  
  setNeedsCompleteProfile: (value: boolean) => {
    set({ needsCompleteProfile: value });
  },
  
  markProfileAsComplete: () => {
    set({ needsCompleteProfile: false });
  },

  initializeFromEnv: () => {
    // En Expo, las variables EXPO_PUBLIC_* se cargan en process.env
    const token = process.env.EXPO_PUBLIC_API_TOKEN;
    const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;
    
    console.log('[authStore] Inicializando desde variables de entorno');
    console.log('  Token disponible:', !!token);
    console.log('  UserId disponible:', !!userId);
    
    if (token && userId) {
      set({ token, userId });
      console.log('[authStore] ✓ Credenciales cargadas exitosamente');
      console.log('  UserId:', userId);
      console.log('  Token (primeros 20 chars):', token.substring(0, 20) + '...');
    } else {
      console.error('[authStore] ✗ No se encontraron credenciales');
      console.error('  EXPO_PUBLIC_API_TOKEN:', token);
      console.error('  EXPO_PUBLIC_TEST_USER_ID:', userId);
    }
  },
}));
