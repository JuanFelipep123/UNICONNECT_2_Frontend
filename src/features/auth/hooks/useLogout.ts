import { useAuthStore } from '@/src/store/authStore';
import { useCallback } from 'react';

export function useLogout() {
  const { clearSession } = useAuthStore();

  const handleLogout = useCallback(async () => {
    try {
      // Al borrar la sesión, el token pasa a null.
      // El useEffect del RootLayout lo detectará y te mandará al login al instante.
      await clearSession();
    } catch (error) {
      console.error('[useLogout] Error al limpiar sesión:', error);
    }
  }, [clearSession]);

  return { handleLogout };
}