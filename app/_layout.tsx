import { router, Stack, useSegments } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
    getOnboardingStatus,
    OnboardingApiError,
} from '../src/features/onboarding/services/onboardingService';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const segments = useSegments();
  const {
    token,
    onboardingResolved,
    needsOnboarding,
    hydrateSession,
    clearSession,
    setNeedsOnboarding,
    setOnboardingResolved,
  } = useAuthStore();

  const [isHydrating, setIsHydrating] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsCheckingOnboarding(true);
      setOnboardingError(null);
      const status = await getOnboardingStatus(token);
      setNeedsOnboarding(status.needsOnboarding);
      setOnboardingResolved(true);
    } catch (error) {
      if (error instanceof OnboardingApiError && [401, 403, 404].includes(error.status)) {
        // Token persisted locally but user/session is no longer valid in backend.
        await clearSession();
        router.replace('/login');
        return;
      }

      if (error instanceof OnboardingApiError) {
        setOnboardingError(
          `No se pudo validar onboarding (HTTP ${error.status}). Verifica backend/ngrok e intenta nuevamente.`
        );
        return;
      }

      setOnboardingError(
        'No se pudo validar tu estado de onboarding. Revisa tu conexion e intenta nuevamente.'
      );
    } finally {
      setIsCheckingOnboarding(false);
    }
  }, [clearSession, setNeedsOnboarding, setOnboardingResolved, token]);

  useEffect(() => {
    const runHydration = async () => {
      await hydrateSession();
      setIsHydrating(false);
    };

    runHydration();
  }, [hydrateSession]);

  useEffect(() => {
    if (isHydrating || !token || onboardingResolved || isCheckingOnboarding) {
      return;
    }

    checkOnboardingStatus();
  }, [
    checkOnboardingStatus,
    isCheckingOnboarding,
    isHydrating,
    onboardingResolved,
    token,
  ]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    const currentGroup = segments[0];
    const isOnLogin = currentGroup === 'login';
    const isOnAuthFallback = currentGroup === 'auth' || currentGroup === 'expo-auth-session';
    const isOnOnboarding = currentGroup === '(onboarding)';

    if (!token) {
      if (!isOnLogin && !isOnAuthFallback) {
        router.replace('/login');
      }
      return;
    }

    if (!onboardingResolved) {
      return;
    }

    if (needsOnboarding) {
      if (!isOnOnboarding) {
        router.replace('/(onboarding)/welcome');
      }
      return;
    }

    if (isOnLogin || isOnAuthFallback || isOnOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isHydrating, needsOnboarding, onboardingResolved, segments, token]);

  if (isHydrating || (token && !onboardingResolved && !onboardingError)) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#00284D" />
        <Text style={styles.loadingText}>Validando sesion...</Text>
      </View>
    );
  }

  if (token && !onboardingResolved && onboardingError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{onboardingError}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={checkOnboardingStatus}
          disabled={isCheckingOnboarding}
        >
          {isCheckingOnboarding ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.retryButtonText}>Reintentar</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" /> 
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="expo-auth-session" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#F7F9FB',
  },
  loadingText: {
    fontSize: 16,
    color: '#1F3D5D',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#1F3D5D',
  },
  retryButton: {
    minWidth: 144,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#00284D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryButtonPressed: {
    opacity: 0.75,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});