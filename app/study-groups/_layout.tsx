/**
 * Layout para las rutas de grupos de estudio
 */

import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

export default function StudyGroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#002147' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        contentStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Grupos',
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="create" options={{ title: 'Nuevo Grupo de Estudio' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalles del Grupo' }} />
    </Stack>
  );
}