import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { hydrateSession } = useAuthStore();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 🛑 CAMBIAMOS "index" por "login" */}
      <Stack.Screen name="login" /> 
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="expo-auth-session" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}