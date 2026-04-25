import Constants from 'expo-constants';

const DEFAULT_API_PORT = '3000';
const DEFAULT_API_PATH = '/api';

const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.trim().length > 0) {
    return normalizeUrl(envBaseUrl);
  }

  const backendPublicUrl = process.env.BACKEND_PUBLIC_URL;
  if (backendPublicUrl && backendPublicUrl.trim().length > 0) {
    return normalizeUrl(backendPublicUrl);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
  }

  console.warn('[apiConfig] No hay URL de backend configurada. Define EXPO_PUBLIC_API_BASE_URL o BACKEND_PUBLIC_URL en .env.');
  return `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`;
}

export const API_BASE_URL = getApiBaseUrl();