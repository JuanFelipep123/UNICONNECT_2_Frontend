/**
 * Hook para manejar la lógica de guardado de perfil
 * Soluciona: Lógica en componente, Callback Hell
 */
import { useCallback, useState } from 'react';
import { profileHttpService } from '../../../services/profileHttpService';
import { ProfileData } from '../types/profile';
import { getErrorMessage, parseError } from '../../../utils/errorHandler';

interface UseProfileSaveReturn {
  saving: boolean;
  error: string | null;
  saveProfile: (profile: ProfileData) => Promise<boolean>;
  clearError: () => void;
}

export const useProfileSave = (): UseProfileSaveReturn => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = useCallback(async (profile: ProfileData): Promise<boolean> => {
    const token = process.env.EXPO_PUBLIC_API_TOKEN;
    const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;

    if (!token || !userId) {
      const errorMsg = 'Faltan credenciales en .env';
      setError(errorMsg);
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      const { career, semester, phone_number, avatar_url } = profile;

      const datosParaBackend = {
        career: career || null,
        semester: semester || null,
        phone_number: phone_number || null,
        avatar_url: avatar_url || null,
      };

      const response = await profileHttpService.updateProfile(userId, datosParaBackend, token);

      if (!response.success) {
        const appError = parseError({ message: response.error });
        const errorMessage = getErrorMessage(appError);
        setError(errorMessage);
        return false;
      }

      return true;
    } catch (err) {
      const appError = parseError(err);
      const errorMessage = getErrorMessage(appError);
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { saving, error, saveProfile, clearError };
};
