/**
 * Hook para obtener la lista de grupos del usuario
 */

import { useAuthStore } from '@/src/store/authStore';
import { useCallback, useEffect, useState } from 'react';
import { groupsHttpService } from '../services/groupsHttpService';
import type { StudyGroup } from '../types/groups';

interface UseUserGroupsReturn {
  adminGroups: StudyGroup[];
  participantGroups: StudyGroup[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useUserGroups = (): UseUserGroupsReturn => {
  const { token } = useAuthStore();
  const [allGroups, setAllGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setError('Se requieren credenciales válidas');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await groupsHttpService.getUserGroups(token);

      if (response.success && response.data) {
        setAllGroups(response.data);
      } else {
        setError(response.error || 'Error desconocido');
        setAllGroups([]);
      }
    } catch (err) {
      console.error('[useUserGroups] Error:', err);
      setError('Error al cargar los grupos');
      setAllGroups([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Separar grupos: administrados vs participante
  const adminGroups = allGroups.filter((g) => g.is_admin);
  const participantGroups = allGroups.filter((g) => !g.is_admin);

  return { adminGroups, participantGroups, loading, error, reload };
};
