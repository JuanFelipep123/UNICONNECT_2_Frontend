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
  updatePhone: (phone: string) => void;
  addSubject: (name: string) => void;
  removeSubject: (id: string) => void;
  saveProfile: () => Promise<boolean>;
}

export const useProfileForm = (initialData?: ProfileData): UseProfileFormReturn => {
  const [profile, setProfile] = useState<ProfileData>(
  initialData || {
        id: '',           // Añadimos el id vacío para cumplir con la interfaz
        carrera: '',
        semestre: 1,
        materias: [],
        nombre: '',       // Es buena práctica inicializar los campos que vas a usar
        celular: '',
        avatar: '',
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

  const updatePhone = useCallback((phone: string) => {
    setProfile((prev) => ({ ...prev, phone }));
  }, []);

  const addSubject = useCallback((name: string) => {
    if (!name.trim()) return;
    
    const newSubject: Subject = {
      id: `${Date.now()}`,
      name: name.trim(),
    };
    
    setProfile((prev) => ({
      ...prev,
      materias: [...prev.materias, newSubject],
    }));
  }, []);

  const removeSubject = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      subjects: prev.materias.filter((subject) => subject.id !== id),
    }));
  }, []);

  const saveProfile = async (): Promise<boolean> => {
    // 1. Obtenemos las credenciales del .env
    const token = process.env.EXPO_PUBLIC_API_TOKEN;
    const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;

    if (!token || !userId) {
      setError("No hay token o ID configurado en el .env");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // CORRECCIÓN AQUÍ:
      // Pasamos el ID del usuario, los datos del perfil y el Token de seguridad
      const response = await profileService.updateProfile(userId, profile, token);
      
      if (!response.success) {
        setError(response.error || "Error al actualizar");
        return false;
      }
      
      return true;
    } catch (err) {
      setError("Error de conexión con el servidor");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updatePhone,
    error,
    updateCareer,
    updateSemester,
    updateAvatar,
    addSubject,
    removeSubject,
    saveProfile,
  };
};
