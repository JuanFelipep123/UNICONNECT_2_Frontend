/**
 * Hook para obtener el detalle de un grupo de estudio
 */

import { useAuthStore } from '@/src/store/authStore';
import { useCallback, useEffect, useState } from 'react';
import { groupsHttpService } from '../services/groupsHttpService';
import type { StudyGroup } from '../types/groups';

interface UseGroupDetailReturn {
  group: StudyGroup | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useGroupDetail = (groupId: string): UseGroupDetailReturn => {
  const { token } = useAuthStore();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token || !groupId) {
      setError('Se requieren credenciales válidas');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await groupsHttpService.getGroup(groupId, token);

      if (response.success && response.data) {
        setGroup(response.data);
      } else {
        setError(response.error || 'Error desconocido');
        setGroup(null);
      }
    } catch (err) {
      console.error('[useGroupDetail] Error:', err);
      setError('Error al cargar el grupo');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [groupId, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { group, loading, error, reload };
};
