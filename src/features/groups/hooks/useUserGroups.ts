/**
 * Hook para obtener la lista de grupos del usuario
 */

import { useAuthStore } from '@/src/store/authStore';
import { useCallback, useEffect, useState } from 'react';
import { groupsHttpService } from '../services/groupsHttpService';
import { subjectsHttpService } from '../services/subjectsHttpService';
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
      const [groupsResponse, subjectsResponse] = await Promise.all([
        groupsHttpService.getUserGroups(token),
        subjectsHttpService.getUserSubjects(token),
      ]);

      const subjectNameById = new Map(
        (subjectsResponse.success && subjectsResponse.data ? subjectsResponse.data : []).map(
          (subject) => [String(subject.id), subject.name]
        )
      );

      if (__DEV__) {
        console.log('[useUserGroups] subjectNameById map:', Object.fromEntries(subjectNameById));
      }

      if (groupsResponse.success && groupsResponse.data) {
        const enrichedGroups = groupsResponse.data.map((group) => {
          if (group.subject?.name) {
            return group;
          }

          const resolvedName = subjectNameById.get(String(group.subject_id));
          if (!resolvedName) {
            return group;
          }

          return {
            ...group,
            subject: {
              id: String(group.subject_id),
              name: resolvedName,
            },
          };
        });

        if (__DEV__) {
          console.log(
            '[useUserGroups] Enriched groups subjects:',
            enrichedGroups.map((group) => ({
              groupId: group.id,
              subject_id: group.subject_id,
              subject: group.subject,
            }))
          );
        }

        setAllGroups(enrichedGroups);
      } else {
        setError(groupsResponse.error || 'Error desconocido');
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
