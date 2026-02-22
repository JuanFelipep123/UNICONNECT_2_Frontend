import { useCallback, useState } from 'react';
import { profileService } from '../../../services/profileService';
import { ProfileData, Subject } from '../types/profile';

interface UseProfileFormReturn {
  profile: ProfileData;
  loading: boolean;
  error: string | null;
  updateCareer: (career: string) => void;
  updateSemester: (semester: number) => void;
  updateAvatar: (uri: string) => void;
  addSubject: (name: string) => void;
  removeSubject: (id: string) => void;
  saveProfile: () => Promise<boolean>;
}

export const useProfileForm = (initialData?: ProfileData): UseProfileFormReturn => {
  const [profile, setProfile] = useState<ProfileData>(
    initialData || {
      career: '',
      semester: 1,
      subjects: [],
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCareer = useCallback((career: string) => {
    setProfile((prev) => ({ ...prev, career }));
  }, []);

  const updateSemester = useCallback((semester: number) => {
    setProfile((prev) => ({ ...prev, semester }));
  }, []);

  const updateAvatar = useCallback((uri: string) => {
    setProfile((prev) => ({ ...prev, avatar: uri }));
  }, []);

  const addSubject = useCallback((name: string) => {
    if (!name.trim()) return;
    
    const newSubject: Subject = {
      id: `${Date.now()}`,
      name: name.trim(),
    };
    
    setProfile((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  }, []);

  const removeSubject = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject.id !== id),
    }));
  }, []);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validación básica
      if (!profile.career) {
        setError('Por favor selecciona una carrera');
        setLoading(false);
        return false;
      }

      if (!profile.semester) {
        setError('Por favor selecciona un semestre');
        setLoading(false);
        return false;
      }

      // Llamar API
      const response = await profileService.saveProfile(profile);
      
      if (!response.success) {
        setError(response.error || 'Error al guardar');
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
      return false;
    }
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updateCareer,
    updateSemester,
    updateAvatar,
    addSubject,
    removeSubject,
    saveProfile,
  };
};
