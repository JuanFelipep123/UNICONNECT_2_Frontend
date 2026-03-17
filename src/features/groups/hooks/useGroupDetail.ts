/**
 * Hook para obtener el detalle de un grupo de estudio
 */

import { useAuthStore } from '@/src/store/authStore';
import { useCallback, useEffect, useState } from 'react';
import { groupsHttpService } from '../services/groupsHttpService';
import { subjectsHttpService } from '../services/subjectsHttpService';
import type { StudyGroup } from '../types/groups';

interface UseGroupDetailReturn {
  group: StudyGroup | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  joinGroup: () => Promise<{ success: boolean; error?: string }>;
  leaveGroup: () => Promise<{ success: boolean; error?: string }>;
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
      const groupData = response.data;

      if (response.success && groupData) {
        let enrichedGroup = groupData;

        if (!groupData.subject?.name && groupData.subject_id) {
          const subjectsResponse = await subjectsHttpService.getUserSubjects(token);

          if (subjectsResponse.success && subjectsResponse.data) {
            const matchedSubject = subjectsResponse.data.find(
              (subject) => String(subject.id) === String(groupData.subject_id)
            );

            if (matchedSubject) {
              enrichedGroup = {
                ...groupData,
                subject: {
                  id: String(groupData.subject_id),
                  name: matchedSubject.name,
                },
              };
            }
          }
        }

        if (__DEV__) {
          console.log('[useGroupDetail] Final subject for detail:', {
            groupId: enrichedGroup.id,
            subject_id: enrichedGroup.subject_id,
            subject: enrichedGroup.subject,
          });
        }

        setGroup(enrichedGroup);
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

  // Ejecuta carga inicial y al cambiar groupId/token (vía reload memoizado)
  useEffect(() => {
    reload();
  }, [reload]);

  const joinGroup = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!token || !groupId) {
      return { success: false, error: 'Se requieren credenciales válidas' };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await groupsHttpService.joinGroup(groupId, token);
      if (!response.success) {
        setError(response.error || 'No se pudo unir al grupo');
        return { success: false, error: response.error };
      }

      // Re-cargar el grupo para asegurar que los flags y miembros estén sincronizados
      await reload();

      return { success: true };
    } catch (err) {
      console.error('[useGroupDetail] Error joining group:', err);
      setError('No se pudo unir al grupo');
      return { success: false, error: 'No se pudo unir al grupo' };
    } finally {
      setLoading(false);
    }
  }, [groupId, reload, token]);

  const leaveGroup = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!token || !groupId) {
      return { success: false, error: 'Se requieren credenciales válidas' };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await groupsHttpService.leaveGroup(groupId, token);
      if (!response.success) {
        setError(response.error || 'No se pudo salir del grupo');
        return { success: false, error: response.error };
      }

      // Re-cargar el grupo para asegurar que los flags y miembros estén sincronizados
      await reload();

      return { success: true };
    } catch (err) {
      console.error('[useGroupDetail] Error leaving group:', err);
      setError('No se pudo salir del grupo');
      return { success: false, error: 'No se pudo salir del grupo' };
    } finally {
      setLoading(false);
    }
  }, [groupId, reload, token]);

  return { group, loading, error, reload, joinGroup, leaveGroup };
};
