export type AuthSyncPayload = {
  auth0_id: string;
  email: string;
  name: string;
};

export type AuthSessionData = {
  userId: string;
  token: string;
};

const authSyncUrl = process.env.EXPO_PUBLIC_AUTH_SYNC_URL;

type AuthSyncResponse = {
  token?: string;
  access_token?: string;
  userId?: string;
  user_id?: string;
  profile_id?: string;
  id?: string;
  data?: AuthSyncResponse;
  user?: AuthSyncResponse;
  profile?: AuthSyncResponse;
};

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

function extractSessionFromResponse(payload: unknown): AuthSessionData | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as AuthSyncResponse;
  const nestedCandidates = [source, source.data, source.user, source.profile].filter(Boolean) as AuthSyncResponse[];

  for (const candidate of nestedCandidates) {
    const token = candidate.token ?? candidate.access_token;
    const userId = candidate.userId ?? candidate.user_id ?? candidate.profile_id ?? candidate.id;

    if (token && userId) {
      return {
        token,
        userId,
      };
    }
  }

  return null;
}

export async function syncAuthUser(payload: AuthSyncPayload): Promise<AuthSessionData> {
  if (!authSyncUrl || authSyncUrl.trim().length === 0) {
    throw new Error('Falta EXPO_PUBLIC_AUTH_SYNC_URL en .env');
  }

  try {
    const response = await fetch(authSyncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    const parsedBody = safeParseJson<unknown>(rawBody);

    if (!response.ok) {
      throw new Error(
        `Error al sincronizar usuario (${response.status}): ${rawBody || 'sin detalle'}`
      );
    }

    const sessionData = extractSessionFromResponse(parsedBody);
    if (!sessionData) {
      throw new Error('Respuesta de auth/sync sin token o userId. Verifica el contrato del backend.');
    }

    return sessionData;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No fue posible sincronizar el usuario.';
    throw new Error(message);
  }
}
