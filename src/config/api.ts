import Constants from 'expo-constants';

const DEFAULT_API_PORT = '3001';
const DEFAULT_API_PATH = '/api';

const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.trim().length > 0) {
    return normalizeUrl(envBaseUrl);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }

  console.warn('[apiConfig] No hostUri disponible. Define EXPO_PUBLIC_API_BASE_URL en .env.');
  return `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
}

export const API_BASE_URL = getApiBaseUrl();