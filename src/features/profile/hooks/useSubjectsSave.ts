/**
 * Hook para guardar cambios de materias
 * Soluciona: Manejo de errores centralizado, lógica en componente
 */
import { useCallback, useState } from 'react';
import { Subject } from './useSubjectsManager';
import { profileHttpService } from '../../../services/profileHttpService';
import { parseError, getErrorMessage } from '../../../utils/errorHandler';

interface UseSubjectsSaveReturn {
  saving: boolean;
  error: string | null;
  saveSubjects: (subjects: Subject[]) => Promise<boolean>;
  clearError: () => void;
}

export const useSubjectsSave = (): UseSubjectsSaveReturn => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSubjects = useCallback(async (subjects: Subject[]): Promise<boolean> => {
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
      const subjectIds = subjects.map((s) => s.id);
      const response = await profileHttpService.updateProfileSubjects(
        userId,
        subjectIds,
        token
      );

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

  return { saving, error, saveSubjects, clearError };
};
