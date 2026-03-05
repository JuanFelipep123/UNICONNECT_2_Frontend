import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { hydrateSession } = useAuthStore();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="expo-auth-session" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile" 
        options={{ headerShown: false }} 
      />
      {/* otras pantallas */}
    </Stack>
  );
}

