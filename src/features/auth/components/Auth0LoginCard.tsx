import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/src/components/ThemedText';

WebBrowser.maybeCompleteAuthSession();

type Auth0UserInfo = {
  email?: string;
  name?: string;
  sub?: string;
};

type Auth0LoginCardProps = {
  onSyncSuccess?: (user: { auth0Id: string; email: string; name: string }) => void;
};

const auth0Domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
const auth0ClientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
const auth0Connection = process.env.EXPO_PUBLIC_AUTH0_CONNECTION ?? 'google-oauth2';
const authSyncUrl = process.env.EXPO_PUBLIC_AUTH_SYNC_URL;
const redirectScheme = process.env.EXPO_PUBLIC_AUTH0_REDIRECT_SCHEME ?? 'uniconnect2';

export function Auth0LoginCard({ onSyncSuccess }: Auth0LoginCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncedUserEmail, setSyncedUserEmail] = useState<string | null>(null);

  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: redirectScheme,
        path: 'auth/callback',
      }),
    []
  );

  const discovery = useMemo(() => {
    if (!auth0Domain) {
      return null;
    }

    return {
      authorizationEndpoint: `https://${auth0Domain}/authorize`,
      tokenEndpoint: `https://${auth0Domain}/oauth/token`,
      userInfoEndpoint: `https://${auth0Domain}/userinfo`,
    };
  }, []);

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

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSyncedUserEmail(null);

      if (!auth0Domain || !auth0ClientId) {
        throw new Error(
          'Faltan variables EXPO_PUBLIC_AUTH0_DOMAIN o EXPO_PUBLIC_AUTH0_CLIENT_ID en .env'
        );
      }

      if (!discovery || !request) {
        throw new Error('La configuración de Auth0 aún no está lista. Intenta de nuevo.');
      }

      const authResult = await promptAsync();

      if (authResult.type !== 'success') {
        throw new Error('El inicio de sesión fue cancelado o falló.');
      }

      const code = authResult.params.code;
      if (!code) {
        throw new Error('No se recibió el código de autorización de Auth0.');
      }

      if (!request.codeVerifier) {
        throw new Error('No se encontró code verifier para completar PKCE.');
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
        { tokenEndpoint: discovery.tokenEndpoint }
      );

      const userInfo = (await AuthSession.fetchUserInfoAsync(
        { accessToken: tokenResponse.accessToken },
        { userInfoEndpoint: discovery.userInfoEndpoint }
      )) as Auth0UserInfo;

      const email = userInfo.email;
      const name = userInfo.name;
      const sub = userInfo.sub;

      if (!email || !name || !sub) {
        throw new Error('No fue posible obtener email, name o sub desde Auth0 /userinfo.');
      }

      if (!authSyncUrl || authSyncUrl.trim().length === 0) {
        throw new Error('Falta EXPO_PUBLIC_AUTH_SYNC_URL en .env');
      }

      const syncResponse = await fetch(authSyncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0_id: sub,
          email,
          name,
        }),
      });

      if (!syncResponse.ok) {
        const responseText = await syncResponse.text();
        throw new Error(
          `Error al sincronizar usuario en backend (${syncResponse.status}): ${responseText || 'sin detalle'}`
        );
      }

      setSyncedUserEmail(email);
      onSyncSuccess?.({ auth0Id: sub, email, name });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error inesperado en el login.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Inicia sesión
      </ThemedText>
      <ThemedText style={styles.subtitle}>Usa tu correo institucional con Google/Auth0.</ThemedText>

      <Pressable
        onPress={handleLogin}
        disabled={!request || isLoading}
        style={({ pressed }) => [
          styles.button,
          (pressed || isLoading || !request) && styles.buttonPressed,
        ]}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <ThemedText type="defaultSemiBold">Continuar con Google</ThemedText>
        )}
      </Pressable>

      {errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}

      {syncedUserEmail ? (
        <ThemedText style={styles.success}>Sincronizado correctamente: {syncedUserEmail}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    opacity: 0.8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  error: {
    fontSize: 14,
  },
  success: {
    fontSize: 14,
  },
});
