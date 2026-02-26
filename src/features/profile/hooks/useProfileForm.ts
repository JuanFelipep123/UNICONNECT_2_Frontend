import { useCallback, useState, useEffect } from 'react';
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
      id: '',
      carrera: '',
      semestre: 1, 
      materias: [],
      nombre: '',
      apellido: '',
      celular: '',
      avatar: '',
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CORRECCIÓN DEL BUCLE INFINITO:
  // Solo sincronizamos si el ID del perfil que llega es diferente al que tenemos
  useEffect(() => {
    if (initialData && initialData.id !== profile.id) {
      console.log("Sincronizando datos iniciales una sola vez...");
      setProfile({
        ...initialData,
        materias: initialData.materias || []
      });
    }
  }, [initialData]);

  // Funciones de actualización (se mantienen igual que en el paso anterior)
  const updateCareer = useCallback((carrera: string) => setProfile(prev => ({ ...prev, carrera })), []);
  const updateSemester = useCallback((semestre: number) => setProfile(prev => ({ ...prev, semestre })), []);
  const updatePhone = useCallback((celular: string) => setProfile(prev => ({ ...prev, celular })), []);
  const updateAvatar = useCallback((uri: string) => setProfile(prev => ({ ...prev, avatar: uri })), []);

  // Manejo de materias (Solo localmente en la pantalla por ahora)
  const addSubject = useCallback((name: string) => {
    if (!name.trim()) return;
    setProfile(prev => ({
      ...prev,
      materias: [...prev.materias, { id: `${Date.now()}`, name: name.trim() }],
    }));
  }, []);

  const removeSubject = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      materias: prev.materias.filter(s => s.id !== id),
    }));
  }, []);

  const saveProfile = async (): Promise<boolean> => {
    const token = process.env.EXPO_PUBLIC_API_TOKEN;
    const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;

    if (!token || !userId) {
      setError("Faltan credenciales en .env");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      /**
       * LIMPIEZA DEFINITIVA: 
       * Extraemos 'materias' para que NO se envíen al backend.
       * Mantenemos solo los campos que existen en tu tabla 'perfil'.
       */
      const { 
        carrera, 
        semestre, 
        celular, 
        avatar // Incluimos avatar ya que lo veo en tu esquema SQL
      } = profile;

      const datosParaBackend = {
        carrera,
        semestre: semestre.toString(), // Tu SQL dice que es 'text', no number
        celular,
        avatar
      };

      console.log("Enviando a tabla perfil:", datosParaBackend);

      const response = await profileService.updateProfile(userId, datosParaBackend, token);
      
      if (!response.success) {
        setError(response.error || "Error al actualizar");
        return false;
      }
      
      return true;
    } catch (err) {
      setError("Error de conexión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updatePhone,
    updateCareer,
    updateSemester,
    updateAvatar,
    addSubject,
    removeSubject,
    saveProfile,
  };
};