/**
 * Servicio de API para sincronización con el backend
 * Responsabilidad: Comunicación HTTP con el backend de autenticación
 */

import type { AuthSession, AuthSyncResponse } from '../types/auth.types';
import { authLogger } from '../utils/logger';

/**
 * Parsea JSON de forma segura
 */
function safeParseJson<T>(value: string): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Extrae la sesión del usuario desde la respuesta del backend
 */
function extractSessionFromResponse(payload: unknown): AuthSession | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as AuthSyncResponse;
  const nestedCandidates = [source, source.data, source.user, source.profile].filter(
    Boolean
  ) as AuthSyncResponse[];

  for (const candidate of nestedCandidates) {
    const token = candidate.token ?? candidate.access_token;
    const userId =
      candidate.userId ?? candidate.user_id ?? candidate.profile_id ?? candidate.id;

    if (token && userId) {
      return { token, userId };
    }
  }

  return null;
}

/**
 * Sincroniza el usuario autenticado con el backend
 */
export async function syncUserWithBackend(
  authSyncUrl: string,
  accessToken: string
): Promise<AuthSession> {
  authLogger.debug('Sincronizando usuario con backend');

  let response: Response;
  
  try {
    response = await fetch(authSyncUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    authLogger.error('Error de red al sincronizar con backend', error);
    throw new Error('No fue posible conectar con el backend para sincronizar la sesión.');
  }

  const rawBody = await response.text();
  const parsedBody = safeParseJson<unknown>(rawBody);

  if (response.status === 401) {
    throw new Error('Tu sesión no fue aceptada por el servidor. Inicia sesión nuevamente.');
  }

  if (!response.ok) {
    authLogger.error(`Error del backend: ${response.status}`, rawBody);
    throw new Error(
      `Error al sincronizar usuario (${response.status}): ${rawBody || 'sin detalle'}`
    );
  }

  const session = extractSessionFromResponse(parsedBody);
  
  if (!session) {
    throw new Error(
      'Respuesta de auth/sync sin token o userId. Verifica el contrato del backend.'
    );
  }

  authLogger.info('Usuario sincronizado correctamente');
  
  return session;
}
