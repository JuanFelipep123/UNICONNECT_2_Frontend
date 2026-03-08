/**
 * Servicio HTTP específico para perfil
 * Soluciona: God Service
 */
import { API_BASE_URL } from '../config/api';
import { ProfileData } from '../features/profile/types/profile';
import { parseError } from '../utils/errorHandler';

export interface Subject {
  id: string;
  name: string;
  code: string;
  career?: string;
  carrera?: string;
  program: string;
  department?: string;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface GetAvailableSubjectsOptions {
  career?: string;
  program?: string;
  search?: string;
  limit?: number;
}

type ReactNativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

const extractSubjectsArray = (payload: unknown): Subject[] => {
  if (Array.isArray(payload)) {
    return payload as Subject[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidates = [record.data, record.subjects, record.result, record.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Subject[];
    }
  }

  return [];
};

console.log('[profileHttpService] Base URL configurada:', API_BASE_URL);

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
      const payload: Record<string, unknown> = {
        semester: profileData.semester || null,
        phone_number: profileData.phone_number || null,
        avatar_url: profileData.avatar_url || null,
      };

      if (Object.prototype.hasOwnProperty.call(profileData, 'career')) {
        payload.career = profileData.career || null;
      }

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
      // RN env allows file-like objects for FormData though DOM typings expect Blob.
      const file: ReactNativeUploadFile = {
        uri,
        type: 'image/jpeg',
        name: `avatar_${id}.jpg`,
      };
      formData.append('file', file as unknown as Blob);

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

  async getAvailableSubjects(
    token: string,
    options: GetAvailableSubjectsOptions = {}
  ): Promise<ApiResponse<Subject[]>> {
    try {
      const query = new URLSearchParams();

      if (options.career?.trim()) {
        query.append('career', options.career.trim());
      }

      if (options.program?.trim()) {
        query.append('program', options.program.trim());
      }

      if (options.search?.trim()) {
        query.append('search', options.search.trim());
      }

      if (typeof options.limit === 'number' && Number.isFinite(options.limit) && options.limit > 0) {
        query.append('limit', String(Math.floor(options.limit)));
      }

      const queryString = query.toString();
      const url = `${API_BASE_URL}/subjects${queryString ? `?${queryString}` : ''}`;
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

      // El backend puede responder con data/subjects/result o array directo.
      const subjects = extractSubjectsArray(result);
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
