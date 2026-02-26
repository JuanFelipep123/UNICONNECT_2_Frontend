import { create } from 'zustand';

interface AuthState {
  needsCompleteProfile: boolean;
  setNeedsCompleteProfile: (value: boolean) => void;
  markProfileAsComplete: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  needsCompleteProfile: false, // Por ahora false, se establece a true después del registro
  
  setNeedsCompleteProfile: (value: boolean) => {
    set({ needsCompleteProfile: value });
  },
  
  markProfileAsComplete: () => {
    set({ needsCompleteProfile: false });
  },
}));
