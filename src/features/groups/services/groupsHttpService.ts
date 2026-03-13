/**
 * Servicio HTTP para Grupos de Estudio
 * Responsabilidad: Comunicación HTTP con el backend de grupos
 */

import { API_BASE_URL } from '@/src/config/api';
import type {
    ApiResponse,
    CreateGroupResponse,
    StudyGroup,
    StudyGroupCreatePayload,
} from '../types/groups';

const GROUPS_ENDPOINT = `${API_BASE_URL}/study-groups`;

/**
 * Lee JSON de forma segura desde una respuesta HTTP
 */
const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Obtiene mensaje de error de la respuesta del backend
 */
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

export const groupsHttpService = {
  /**
   * Crea un nuevo grupo de estudio
   */
  async createGroup(
    payload: StudyGroupCreatePayload,
    token: string
  ): Promise<ApiResponse<CreateGroupResponse>> {
    try {
      const response = await fetch(GROUPS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await readJson(response);

      if (response.ok) {
        // Status 201 Created
        return {
          success: true,
          data: data as CreateGroupResponse,
        };
      }

      return {
        success: false,
        error: getErrorMessage(data, response.status),
      };
    } catch (error) {
      console.error('[groupsHttpService.createGroup] Error de red:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
  },

  /**
   * Obtiene un grupo específico por ID
   */
  async getGroup(id: string, token: string): Promise<ApiResponse<StudyGroup>> {
    try {
      const response = await fetch(`${GROUPS_ENDPOINT}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readJson(response);

      if (response.ok) {
        return {
          success: true,
          data: data as StudyGroup,
        };
      }

      return {
        success: false,
        error: getErrorMessage(data, response.status),
      };
    } catch (error) {
      console.error('[groupsHttpService.getGroup] Error de red:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
  },

  /**
   * Obtiene grupos del usuario (creados o participante)
   */
  async getUserGroups(token: string): Promise<ApiResponse<StudyGroup[]>> {
    try {
      const response = await fetch(`${GROUPS_ENDPOINT}/my-groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await readJson(response);

      if (response.ok) {
        let groupsArray: StudyGroup[] = [];

        if (Array.isArray(json)) {
          groupsArray = json as StudyGroup[];
        } else if (json && typeof json === 'object') {
          const payload = json as Record<string, unknown>;
          if (Array.isArray(payload.data)) {
            groupsArray = payload.data as StudyGroup[];
          } else if (Array.isArray(payload.groups)) {
            groupsArray = payload.groups as StudyGroup[];
          }
        }

        return {
          success: true,
          data: groupsArray,
        };
      }

      return {
        success: false,
        error: getErrorMessage(json, response.status),
      };
    } catch (error) {
      console.error('[groupsHttpService.getUserGroups] Error de red:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
  },
};
