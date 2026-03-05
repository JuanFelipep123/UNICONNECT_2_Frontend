import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { syncAuthUser } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

type Auth0UserInfo = {
  email?: string;
  name?: string;
  sub?: string;
};

const AUTH_CALLBACK_PATH = 'auth/callback';
const INSTITUTIONAL_DOMAIN = '@ucaldas.edu.co';

type AuthSessionNonSuccess = { type: 'cancel' | 'dismiss' | 'locked' | 'opened' };

function isValidInstitutionalEmail(email: string) {
  return email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);
}

function buildAuthErrorMessage(result: AuthSessionNonSuccess | { type: 'error'; error?: Error | null }) {
  if (result.type === 'dismiss' || result.type === 'cancel') {
    return 'No se pudo completar el retorno a la app tras el login. Verifica la Callback URL en Auth0 y usa Development Build si estas en Expo Go.';
  }

  if (result.type === 'error') {
    return result.error?.message ?? 'Error de autenticación.';
  }

  return 'El inicio de sesión fue cancelado o falló.';
}

export function useAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const auth0Domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
  const auth0ClientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
  const auth0Connection = process.env.EXPO_PUBLIC_AUTH0_CONNECTION ?? 'google-oauth2';
  const redirectScheme = process.env.EXPO_PUBLIC_AUTH0_REDIRECT_SCHEME ?? 'uniconnect2';
  const explicitRedirectUriRaw = process.env.EXPO_PUBLIC_AUTH0_REDIRECT_URI?.trim();
  const explicitRedirectUri =
    explicitRedirectUriRaw && explicitRedirectUriRaw.toLowerCase() !== 'auto'
      ? explicitRedirectUriRaw
      : undefined;

  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo';

  const projectNameForProxy = useMemo(() => {
    const owner = Constants.expoConfig?.owner;
    const slug = Constants.expoConfig?.slug;

    if (owner && slug) {
      return `@${owner}/${slug}`;
    }

    return undefined;
  }, []);

  const expoProxyRedirectUri = useMemo(() => {
    if (!projectNameForProxy) {
      return undefined;
    }

    return `https://auth.expo.io/${projectNameForProxy}`;
  }, [projectNameForProxy]);

  const expoProxyReturnUri = useMemo(() => {
    if (!isExpoGo) {
      return undefined;
    }

    // Expo proxy uses this as return target to reopen Expo Go.
    return AuthSession.makeRedirectUri({ path: 'expo-auth-session' });
  }, [isExpoGo]);

  const redirectUri = useMemo(() => {
    if (explicitRedirectUri) {
      return explicitRedirectUri;
    }

    if (isExpoGo) {
      // Expo Go requires proxy-based callback to resume app reliably.
      if (expoProxyRedirectUri) {
        return expoProxyRedirectUri;
      }

      console.warn('[useAuthLogin] No se encontro owner/slug. Usando redirectUri con scheme.');
    }

    return AuthSession.makeRedirectUri({
      scheme: redirectScheme,
      path: AUTH_CALLBACK_PATH,
    });
  }, [explicitRedirectUri, expoProxyRedirectUri, isExpoGo, redirectScheme]);

  const discovery = useMemo(() => {
    if (!auth0Domain) {
      return null;
    }

    return {
      authorizationEndpoint: `https://${auth0Domain}/authorize`,
      tokenEndpoint: `https://${auth0Domain}/oauth/token`,
      userInfoEndpoint: `https://${auth0Domain}/userinfo`,
    };
  }, [auth0Domain]);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId ?? '',
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      scopes: ['openid', 'profile', 'email'],
      extraParams: {
        connection: auth0Connection,
        prompt: 'select_account',
      },
    },
    discovery
  );

  useEffect(() => {
    console.log('[useAuthLogin] redirectUri en uso:', redirectUri);
  }, [redirectUri]);

  const runExpoGoAuthFlow = useCallback(async () => {
    if (!expoProxyRedirectUri || !expoProxyReturnUri) {
      throw new Error('No se pudo construir la URL de proxy de Expo. Verifica owner/slug en app.json.');
    }

    if (!request?.url) {
      throw new Error('La URL de autorización aún no está lista. Intenta de nuevo.');
    }

    const startParams = new URLSearchParams({
      authUrl: request.url,
      returnUrl: expoProxyReturnUri,
    });

    const startUrl = `${expoProxyRedirectUri}/start?${startParams.toString()}`;
    const browserResult = await WebBrowser.openAuthSessionAsync(startUrl, expoProxyReturnUri);

    if (browserResult.type !== 'success') {
      return { type: browserResult.type } as AuthSessionNonSuccess;
    }

    return request.parseReturnUrl(browserResult.url);
  }, [expoProxyRedirectUri, expoProxyReturnUri, request]);

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (!auth0Domain || !auth0ClientId) {
        throw new Error('Faltan EXPO_PUBLIC_AUTH0_DOMAIN y/o EXPO_PUBLIC_AUTH0_CLIENT_ID en .env');
      }

      if (!discovery || !request) {
        throw new Error('La configuración de Auth0 aún no está lista.');
      }

      const authResult = isExpoGo ? await runExpoGoAuthFlow() : await promptAsync();

      if (authResult.type !== 'success') {
        if (authResult.type === 'error') {
          throw new Error(buildAuthErrorMessage({ type: 'error', error: authResult.error }));
        }

        throw new Error(buildAuthErrorMessage(authResult as AuthSessionNonSuccess));
      }

      const code = authResult.params.code;
      if (!code) {
        throw new Error('No se recibió código de autorización.');
      }

      if (!request.codeVerifier) {
        throw new Error('No se encontró code verifier para PKCE.');
      }

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: auth0ClientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        {
          tokenEndpoint: discovery.tokenEndpoint,
        }
      );

      const userInfo = (await AuthSession.fetchUserInfoAsync(
        { accessToken: tokenResponse.accessToken },
        { userInfoEndpoint: discovery.userInfoEndpoint }
      )) as Auth0UserInfo;

      const email = userInfo.email;
      const name = userInfo.name;
      const sub = userInfo.sub;

      if (!email || !name || !sub) {
        throw new Error('No fue posible obtener email, name y sub desde /userinfo.');
      }

      if (!isValidInstitutionalEmail(email)) {
        throw new Error(`Solo se permiten correos institucionales ${INSTITUTIONAL_DOMAIN}.`);
      }

      const session = await syncAuthUser({
        auth0_id: sub,
        email,
        name,
      });

      return {
        auth0Id: sub,
        email,
        name,
        userId: session.userId,
        token: session.token,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error en el inicio de sesión.';
      setErrorMessage(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    auth0ClientId,
    auth0Domain,
    discovery,
    isExpoGo,
    promptAsync,
    redirectUri,
    request,
    runExpoGoAuthFlow,
  ]);

  return {
    isLoading,
    errorMessage,
    canLogin: Boolean(request) && !isLoading,
    redirectUri,
    handleLogin,
  };
}
