/**
 * Servicio HTTP para Materias del Usuario
 */

import { API_BASE_URL } from '@/src/config/api';

export interface Subject {
  id: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const SUBJECTS_ENDPOINT = `${API_BASE_URL}/subjects`;

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getErrorMessage = (payload: unknown, fallbackStatus: number): string => {
  if (payload && typeof payload === 'object') {
    const maybeError = payload as Record<string, unknown>;
    if (maybeError.error && typeof maybeError.error === 'string' && maybeError.error.trim().length > 0) {
      return maybeError.error;
    }
    if (maybeError.message && typeof maybeError.message === 'string' && maybeError.message.trim().length > 0) {
      return maybeError.message;
    }
  }
  return `Error ${fallbackStatus}`;
};

export const subjectsHttpService = {
  /**
   * Obtiene las materias del usuario autenticado
   * Backend devuelve: { data: [{ id, name }], error: null, statusCode: 200 }
   */
  async getUserSubjects(token: string): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await fetch(`${SUBJECTS_ENDPOINT}/my-subjects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await readJson(response);

      if (response.ok) {
        // Extrae correctamente el array de materias según el formato del backend
        let subjectsArray: Subject[] = [];
        
        if (Array.isArray(json)) {
          // Si es un array directo
          subjectsArray = json;
        } else if (json && typeof json === 'object') {
          const payload = json as Record<string, unknown>;
          // Si tiene propiedad 'data' con el array
          if (Array.isArray(payload.data)) {
            subjectsArray = payload.data as Subject[];
          }
          // Si tiene propiedad 'subjects' con el array
          else if (Array.isArray(payload.subjects)) {
            subjectsArray = payload.subjects as Subject[];
          }
        }

        return {
          success: true,
          data: subjectsArray,
        };
      }

      return {
        success: false,
        error: getErrorMessage(json, response.status),
      };
    } catch (error) {
      console.error('[subjectsHttpService.getUserSubjects] Error de red:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
  },
};
