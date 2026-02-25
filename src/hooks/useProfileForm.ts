import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { ProfileData, Subject } from '../features/profile/types/profile';

export const useProfileForm = () => {
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    nombre: '',
    apellido: '', // Ajustado a singular
    carrera: '',
    semestre: 1,
    materias: [],
    celular: '',
    avatar: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... (fetchInitialData se mantiene igual)

  // NUEVA: Para actualizar el apellido
  const updateLastName = (apellido: string) => 
    setProfile((prev) => ({ ...prev, apellido }));

  const updateCareer = (carrera: string) => setProfile((prev) => ({ ...prev, carrera }));
  const updateSemester = (semestre: number) => setProfile((prev) => ({ ...prev, semestre }));
  const updatePhone = (celular: string) => setProfile((prev) => ({ ...prev, celular }));
  const updateAvatar = (avatar: string) => setProfile((prev) => ({ ...prev, avatar }));
  
  const addSubject = (materias: Subject) => {
    setProfile((prev) => ({
      ...prev,
      materias: [...prev.materias, materias]
    }));
  };

  const removeSubject = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      materias: prev.materias.filter(s => s.id !== id)
    }));
  };

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
      // 1. MAPEAMOS LOS DATOS EXACTOS DE LA TABLA 'perfil'
      // Ya no necesitamos el 'as any' porque la interfaz ya coincide
      const profileToUpdate = {
        nombre: profile.nombre,
        apellido: profile.apellido, // Singular
        carrera: profile.carrera,
        semestre: profile.semestre,
        celular: profile.celular
      };

      // 2. ACTUALIZAMOS PERFIL
      const profileResponse = await profileService.updateProfile(userId, profileToUpdate, token);
      
      if (!profileResponse.success) {
        setError(profileResponse.error || "Error al guardar perfil");
        return false;
      }

      // 3. ACTUALIZAMOS MATERIAS (Tabla intermedia perfil_materia)
      // Solo enviamos si hay cambios o si tu lógica de backend lo requiere
      if (profile.materias.length > 0) {
        const subjectIds = profile.materias.map(m => m.id);
        const subjectsResponse = await profileService.updateProfileSubjects(userId, subjectIds, token);
        
        if (!subjectsResponse.success) {
          console.warn("Perfil guardado, pero hubo error en materias:", subjectsResponse.error);
        }
      }

      return true;
    } catch (err) {
      setError("Error de red al intentar guardar");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateLastName, // Exportamos la nueva función
    updateCareer,
    updateSemester,
    updateAvatar,
    updatePhone,
    addSubject,
    removeSubject,
    saveProfile,
  };
};