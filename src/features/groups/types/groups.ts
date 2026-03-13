/**
 * Tipos para el módulo de Grupos de Estudio
 */

import type { Subject } from '@/src/features/profile/types/profile';

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Categoría académica de un grupo
 */
export type StudyGroupCategory = 'ACADEMIC' | 'PROJECT' | 'SOCIAL' | 'SPORTS';

/**
 * Datos mínimos de un grupo de estudio
 */
export interface StudyGroupCreatePayload {
  name: string;
  description: string;
  subject_id: string;
}

/**
 * Grupo de estudio retornado por el backend
 */
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject_id: string;
  subject?: Subject;
  category?: StudyGroupCategory;
  creator_id: string;
  created_at: string;
  updated_at?: string;
  member_count?: number;
  is_admin: boolean;
}

/**
 * Respuesta de creación de grupo
 */
export interface CreateGroupResponse {
  id: string;
  name: string;
  description: string;
  subject_id: string;
  created_at: string;
  created_by: string;
}
