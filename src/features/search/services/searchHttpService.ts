/**
 * Servicio HTTP para la feature de búsqueda de compañeros (US-005).
 * Separa las llamadas al backend de la lógica de la UI.
 */
import Constants from "expo-constants";
import { parseError } from "../../../utils/errorHandler";
import type { Classmate, SearchSubject } from "../types/search";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    console.warn(
      "[searchHttpService] No hostUri disponible, usando URL de producción",
    );
    return "https://tu-api-produccion.com/api";
  }
  const ip = hostUri.split(":")[0];
  const baseUrl = `http://${ip}:3001/api`;
  console.log("[searchHttpService] Base URL:", baseUrl);
  return baseUrl;
};

const API_BASE_URL = getBaseUrl();

export const searchHttpService = {
  /**
   * GET /api/subjects?profile_id=:profileId
   * Devuelve las materias inscritas del perfil autenticado.
   */
  async getSubjectsByProfile(
    profileId: string,
    token: string,
  ): Promise<ApiResponse<SearchSubject[]>> {
    try {
      const url = `${API_BASE_URL}/perfil-materias/${profileId}`;
      console.log("[searchHttpService] GET", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `Error ${response.status}`);
      }

      return { success: true, data: json.data ?? json };
    } catch (error) {
      const appError = parseError(error);
      console.error(
        "[searchHttpService] getSubjectsByProfile error:",
        appError.message,
      );
      return { success: false, error: appError.message };
    }
  },

  /**
   * GET /api/students/classmates/:subjectId
   * Devuelve la lista de compañeros inscritos en la materia.
   */
  async getClassmatesBySubject(
    subjectId: string,
    token: string,
  ): Promise<ApiResponse<Classmate[]>> {
    try {
      const url = `${API_BASE_URL}/students/classmates/${subjectId}`;
      console.log("[searchHttpService] GET", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `Error ${response.status}`);
      }

      return { success: true, data: json.data ?? json };
    } catch (error) {
      const appError = parseError(error);
      console.error(
        "[searchHttpService] getClassmatesBySubject error:",
        appError.message,
      );
      return { success: false, error: appError.message };
    }
  },
};
