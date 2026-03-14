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

  // Efecto que SOLO depende de groupId y token, no de reload
  // Esto evita infinite loop
  useEffect(() => {
    reload();
  }, [groupId, token]);

  return { group, loading, error, reload };
};
