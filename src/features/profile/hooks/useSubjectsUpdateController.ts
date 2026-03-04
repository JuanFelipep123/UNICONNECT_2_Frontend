import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { profileHttpService, type Subject } from '../../../services/profileHttpService';
import { useLoadAvailableSubjects } from './useLoadAvailableSubjects';
import { useLoadProfileSubjects } from './useLoadProfileSubjects';
import { useSubjectsManager } from './useSubjectsManager';
import { useSubjectsSave } from './useSubjectsSave';

export const useSubjectsUpdateController = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [addingSubjectIds, setAddingSubjectIds] = useState<Set<string>>(new Set());
  const [removingSubjectIds, setRemovingSubjectIds] = useState<Set<string>>(new Set());
  const [addingError, setAddingError] = useState<string | null>(null);

  const token = process.env.EXPO_PUBLIC_API_TOKEN || '';
  const profileId = process.env.EXPO_PUBLIC_TEST_USER_ID || '';

  const {
    subjects: profileSubjects,
    loading: loadingProfile,
    error: errorProfile,
    reload: reloadProfile,
  } = useLoadProfileSubjects(profileId, token);

  const {
    subjects: availableSubjects,
    loading: loadingAvailable,
    error: errorAvailable,
    reload: reloadAvailable,
  } = useLoadAvailableSubjects(token);

  const initialSubjects = useMemo(() => {
    if (profileSubjects.length > 0) {
      return profileSubjects;
    }

    try {
      if (params.initialSubjects) {
        return JSON.parse(params.initialSubjects as string) as Subject[];
      }
    } catch {
      console.error('Error al parsear subjects iniciales');
    }

    return [];
  }, [params.initialSubjects, profileSubjects]);

  const {
    currentSubjects,
    filteredSubjects,
    searchQuery,
    addSubject,
    removeSubject,
    setSearchQuery,
  } = useSubjectsManager(initialSubjects, availableSubjects);

  const { saving, error: savingError, clearError } = useSubjectsSave();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(async () => {
    console.log('[SubjectsUpdateScreen] Reintentando carga...');
    await reloadProfile();
    await reloadAvailable();
  }, [reloadAvailable, reloadProfile]);

  const handleAddSubject = useCallback(
    async (subject: Subject) => {
      if (!token || !profileId) {
        setAddingError('Credenciales no disponibles');
        return;
      }

      addSubject(subject);
      setAddingSubjectIds((prev) => new Set([...prev, subject.id]));
      setAddingError(null);

      try {
        const response = await profileHttpService.addSubjectToProfile(profileId, subject.id, token);

        if (!response.success) {
          removeSubject(subject.id);
          const errorMessage = response.error || 'Error al agregar materia';
          setAddingError(errorMessage);
          Alert.alert('Error', errorMessage);
        }
      } catch (error) {
        removeSubject(subject.id);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setAddingError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setAddingSubjectIds((prev) => {
          const next = new Set(prev);
          next.delete(subject.id);
          return next;
        });
      }
    },
    [addSubject, profileId, removeSubject, token]
  );

  const handleRemoveSubject = useCallback(
    async (subjectId: string) => {
      if (!token || !profileId) {
        setAddingError('Credenciales no disponibles');
        return;
      }

      removeSubject(subjectId);
      setRemovingSubjectIds((prev) => new Set([...prev, subjectId]));
      setAddingError(null);

      try {
        const response = await profileHttpService.removeSubjectFromProfile(profileId, subjectId, token);

        if (!response.success) {
          const subjectToRestore = profileSubjects.find((subject) => subject.id === subjectId);
          if (subjectToRestore) {
            addSubject(subjectToRestore);
          }
          const errorMessage = response.error || 'Error al eliminar materia';
          setAddingError(errorMessage);
          Alert.alert('Error', errorMessage);
        }
      } catch (error) {
        const subjectToRestore = profileSubjects.find((subject) => subject.id === subjectId);
        if (subjectToRestore) {
          addSubject(subjectToRestore);
        }
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setAddingError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setRemovingSubjectIds((prev) => {
          const next = new Set(prev);
          next.delete(subjectId);
          return next;
        });
      }
    },
    [addSubject, profileId, profileSubjects, removeSubject, token]
  );

  const handleSave = useCallback(async () => {
    router.back();
  }, [router]);

  return {
    currentSubjects,
    filteredSubjects,
    searchQuery,
    setSearchQuery,
    addingSubjectIds,
    removingSubjectIds,
    addingError,
    setAddingError,
    saving,
    savingError,
    clearError,
    handleGoBack,
    handleRetry,
    handleAddSubject,
    handleRemoveSubject,
    handleSave,
    isLoading: loadingProfile || loadingAvailable,
    loadError: errorProfile || errorAvailable,
    errorProfile,
    errorAvailable,
  };
};
