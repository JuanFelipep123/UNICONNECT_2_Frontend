import { ProfileData } from '../features/profile/types/profile';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// TODO: Reemplazar con tu URL base de API real
const API_BASE_URL = 'https://api.example.com';

export const profileService = {
  /**
   * Obtiene el perfil actual del usuario
   */
  async getProfile(): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  /**
   * Guarda o actualiza el perfil del usuario
   */
  async saveProfile(profileData: ProfileData): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error saving profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar',
      };
    }
  },

  /**
   * Carga una foto de perfil
   */
  async uploadAvatar(uri: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          // TODO: Agregar token de autenticación
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al subir foto',
      };
    }
  },
};
