import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { initializeFromEnv } = useAuthStore();

  useEffect(() => {
    // Inicializar credenciales desde variables de entorno
    initializeFromEnv();
  }, [initializeFromEnv]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile" 
        options={{ headerShown: false }} 
      />
      {/* otras pantallas */}
    </Stack>
  );
}

