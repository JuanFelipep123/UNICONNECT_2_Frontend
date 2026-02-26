import Constants from 'expo-constants';
import { ProfileData } from '../features/profile/types/profile';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'https://tu-api-produccion.com/api';
  
  const ip = hostUri.split(':')[0];
  // Asegúrate de que tu backend use el prefijo /api si así lo configuraste
  return `http://${ip}:3001/api`; 
};

const API_BASE_URL = getBaseUrl();

export const profileService = {
  async getProfileById(id: string, token: string): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error: ${response.status}`);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error de conexión' };
    }
  },

  async updateProfile(id: string, profileData: any, token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error: ${response.status}`);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error al guardar cambios' };
    }
  },

  /**
   * NUEVO: Para guardar la relación en perfil_materia
   */
  async updateProfileSubjects(id: string, subjectIds: string[], token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectIds }),
      });
      const result = await response.json();
      return { success: response.ok, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error: 'Error al actualizar materias' };
    }
  },

  async uploadAvatar(id: string, uri: string, token: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', { uri, type: 'image/jpeg', name: `avatar_${id}.jpg` });

      const response = await fetch(`${API_BASE_URL}/profiles/${id}/avatar`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error: ${response.status}`);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error al subir foto' };
    }
  },
};