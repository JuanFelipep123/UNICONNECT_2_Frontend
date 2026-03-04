/**
 * Hook para manejar la carga de perfil
 * Soluciona: Lógica en componente, useEffect mal usado
 */
import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../../../services/profileService';
import { ProfileData } from '../types/profile';
import { getErrorMessage, parseError } from '../../../utils/errorHandler';

interface UseProfileLoadReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
}

export const useProfileLoad = (): UseProfileLoadReturn => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const token = process.env.EXPO_PUBLIC_API_TOKEN;
    const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;

    if (!token || !userId) {
      setError('Faltan variables de entorno .env');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await profileService.getProfileById(userId, token);

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        const appError = parseError({ message: response.error });
        const errorMessage = getErrorMessage(appError);
        setError(errorMessage);
      }
    } catch (err) {
      const appError = parseError(err);
      const errorMessage = getErrorMessage(appError);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar perfil solamente por primera vez
  useEffect(() => {
    loadProfile();
    // Se omite loadProfile de las dependencias porque queremos ejecutar solo una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, loading, error, loadProfile };
};
