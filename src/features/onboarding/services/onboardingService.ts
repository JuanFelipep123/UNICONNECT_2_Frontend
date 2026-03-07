import { API_BASE_URL } from '../../../config/api';

const ONBOARDING_STATUS_URL = `${API_BASE_URL}/onboarding/status`;
const ONBOARDING_COMPLETE_URL = `${API_BASE_URL}/onboarding/complete`;

export class OnboardingApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'OnboardingApiError';
    this.status = status;
  }
}

interface OnboardingStatusResponse {
  needsOnboarding: boolean;
}

interface OnboardingStatusCandidate {
  needsOnboarding?: boolean;
  needs_onboarding?: boolean;
  data?: OnboardingStatusCandidate;
  user?: OnboardingStatusCandidate;
  profile?: OnboardingStatusCandidate;
  result?: OnboardingStatusCandidate;
}

function extractNeedsOnboarding(payload: unknown): boolean | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as OnboardingStatusCandidate;
  const candidates = [source, source.data, source.user, source.profile, source.result].filter(
    Boolean
  ) as OnboardingStatusCandidate[];

  for (const candidate of candidates) {
    const value = candidate.needsOnboarding ?? candidate.needs_onboarding;
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return null;
}

export async function getOnboardingStatus(token: string): Promise<OnboardingStatusResponse> {
  let response: Response;

  try {
    response = await fetch(ONBOARDING_STATUS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error('No fue posible conectar con el servicio de onboarding.');
  }

  const bodyText = await response.text();

  if (!response.ok) {
    throw new OnboardingApiError(
      bodyText || `No fue posible obtener el estado de onboarding (${response.status}).`,
      response.status
    );
  }

  let parsedBody: unknown;

  try {
    parsedBody = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error('Respuesta inválida al consultar el estado de onboarding.');
  }

  const needsOnboarding = extractNeedsOnboarding(parsedBody);

  if (needsOnboarding === null) {
    throw new Error('El backend no devolvió needsOnboarding como booleano.');
  }

  return { needsOnboarding };
}

export async function completeOnboarding(token: string, skipped: boolean): Promise<void> {
  let response: Response;

  try {
    response = await fetch(ONBOARDING_COMPLETE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skipped }),
    });
  } catch {
    throw new Error('No fue posible completar el onboarding por un problema de red.');
  }

  const bodyText = await response.text();

  if (!response.ok) {
    throw new OnboardingApiError(
      bodyText || `No fue posible completar el onboarding (${response.status}).`,
      response.status
    );
  }
}
