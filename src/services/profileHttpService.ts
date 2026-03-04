/**
 * Servicio HTTP específico para perfil
 * Soluciona: God Service
 */
import Constants from 'expo-constants';
import { ProfileData } from '../features/profile/types/profile';
import { parseError } from '../utils/errorHandler';

export interface Subject {
  id: string;
  name: string;
  code: string;
  program: string;
  department?: string;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    console.warn('[profileHttpService] No hostUri disponible, usando URL de producción');
    return 'https://tu-api-produccion.com/api';
  }

  const ip = hostUri.split(':')[0];
  const baseUrl = `http://${ip}:3001/api`;
  console.log('[profileHttpService] Base URL construida:', baseUrl);
  return baseUrl;
};

const API_BASE_URL = getBaseUrl();

export const profileHttpService = {
  async getProfileById(id: string, token: string): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error: ${response.status}`);
      }

      return { success: true, data: result.data };
    } catch (error) {
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async updateProfile(
    id: string,
    profileData: Partial<ProfileData>,
    token: string
  ): Promise<ApiResponse<ProfileData>> {
    try {
      const payload = {
        career: profileData.career || null,
        semester: profileData.semester || null,
        phone_number: profileData.phone_number || null,
        avatar_url: profileData.avatar_url || null,
      };

      const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error: ${response.status}`);
      }

      return { success: true, data: result.data };
    } catch (error) {
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async updateProfileSubjects(
    id: string,
    subjectIds: string[],
    token: string
  ): Promise<ApiResponse<object>> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subjectIds }),
      });

      const result = await response.json();

      return { success: response.ok, data: result.data, error: result.error };
    } catch (error) {
      const appError = parseError(error);
      return { success: false, error: appError.message };
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error: ${response.status}`);
      }

      return { success: true, data: result.data };
    } catch (error) {
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async getProfileSubjects(profileId: string, token: string): Promise<ApiResponse<Subject[]>> {
    const url = `${API_BASE_URL}/profile-subjects/${profileId}`;
    console.log('\n========== [getProfileSubjects] INICIANDO ==========');
    console.log('Obteniendo materias del perfil...');
    console.log('URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('STATUS CODE:', response.status);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('ERROR PARSEANDO JSON:', parseError);
        throw new Error('No se pudo parsear la respuesta como JSON');
      }

      if (!response.ok) {
        const errorMsg = result?.error || result?.message || `HTTP ${response.status}`;
        console.error('RESPUESTA NO OK - ERROR:', errorMsg);
        throw new Error(errorMsg);
      }

      // El endpoint /perfil-materias retorna directamente un array en data
      let subjects: Subject[] = [];
      
      if (Array.isArray(result.data)) {
        console.log('Materias encontradas en array data');
        subjects = result.data;
      } else if (Array.isArray(result)) {
        console.log('Result es un array directo');
        subjects = result;
      } else {
        console.warn('No se encontraron materias. Estructura resultado:', Object.keys(result));
        subjects = [];
      }

      console.log('MATERIAS EXTRAIDAS:', subjects.length, 'items');
      if (subjects.length > 0) {
        console.log('Primera materia:', subjects[0]);
      }
      console.log('========== [getProfileSubjects] EXITOSO ==========\n');
      return { success: true, data: subjects };
      
    } catch (error) {
      console.error('========== [getProfileSubjects] EXCEPCION ==========');
      console.error('Error:', error instanceof Error ? error.message : String(error));
      console.error('=================================================\n');
      
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async getAvailableSubjects(token: string): Promise<ApiResponse<Subject[]>> {
    try {
      const url = `${API_BASE_URL}/subjects`;
      console.log('[getAvailableSubjects] Llamando a:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[getAvailableSubjects] Response status:', response.status);
      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || `Error: ${response.status}`;
        console.error('[getAvailableSubjects] Error response:', errorMsg);
        throw new Error(errorMsg);
      }

      // Asegurar que siempre retorna un array
      const subjects = Array.isArray(result.data) ? result.data : [];
      console.log('[getAvailableSubjects] Materias obtenidas:', subjects.length, 'items');
      return { success: true, data: subjects };
    } catch (error) {
      console.error('[getAvailableSubjects] Excepción:', error);
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async addSubjectToProfile(
    profileId: string,
    subjectId: string,
    token: string
  ): Promise<ApiResponse<object>> {
    const url = `${API_BASE_URL}/profile-subjects`;
    console.log('\n[addSubjectToProfile] Agregando materia al perfil...');
    console.log('  URL:', url);
    console.log('  Profile ID:', profileId);
    console.log('  Subject ID:', subjectId);
    
    try {
      const payload = {
        profile_id: profileId,
        subject_id: subjectId,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[addSubjectToProfile] Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('[addSubjectToProfile] ERROR PARSEANDO JSON:', parseError);
        throw new Error('No se pudo parsear la respuesta');
      }

      if (!response.ok) {
        const errorMsg = result?.error || result?.message || `HTTP ${response.status}`;
        console.error('[addSubjectToProfile] Error response:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[addSubjectToProfile] ✓ Materia agregada exitosamente');
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('[addSubjectToProfile] ✗ Excepción:', error);
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },

  async removeSubjectFromProfile(
    profileId: string,
    subjectId: string,
    token: string
  ): Promise<ApiResponse<object>> {
    const url = `${API_BASE_URL}/profile-subjects`;
    console.log('\n[removeSubjectFromProfile] Eliminando materia del perfil...');
    console.log('  URL:', url);
    console.log('  Profile ID:', profileId);
    console.log('  Subject ID:', subjectId);
    
    try {
      const payload = {
        profile_id: profileId,
        subject_id: subjectId,
      };

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[removeSubjectFromProfile] Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('[removeSubjectFromProfile] ERROR PARSEANDO JSON:', parseError);
        throw new Error('No se pudo parsear la respuesta');
      }

      if (!response.ok) {
        const errorMsg = result?.error || result?.message || `HTTP ${response.status}`;
        console.error('[removeSubjectFromProfile] Error response:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[removeSubjectFromProfile] ✓ Materia eliminada exitosamente');
      return { success: true, data: result.data };
      
    } catch (error) {
      console.error('[removeSubjectFromProfile] ✗ Excepción:', error);
      const appError = parseError(error);
      return { success: false, error: appError.message };
    }
  },
};
