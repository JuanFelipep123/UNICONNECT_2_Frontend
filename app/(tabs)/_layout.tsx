import { Ionicons } from '@expo/vector-icons';
import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet } from 'react-native';

import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAuthStore } from '@/src/store/authStore';

export default function TabLayout() {
  const { token, clearSession } = useAuthStore();
  const router = useRouter();

  // 🛑 EL GUARDIÁN INTELIGENTE
  // Solo se ejecuta si esta pantalla está ACTIVA y VISIBLE
  useFocusEffect(
    useCallback(() => {
      if (!token) {
        console.log('[TabsLayout] Pestaña activa sin token. Echando al usuario...');
        router.replace('/login');
      }
    }, [token, router]) // Reacciona si el token cambia mientras la miras
  );

  // Manejador de logout con alerta de confirmación
  const handleLogoutWithConfirmation = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, salir',
          style: 'destructive',
          onPress: async () => {
            // TÚ controlas la navegación directamente, sin intermediarios
            await clearSession();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00284D',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#00284D',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerRightContainerStyle: styles.headerRightContainer,
        headerRight: () => (
          <Pressable
            onPress={handleLogoutWithConfirmation}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
            accessibilityHint="Cierra tu sesión actual y regresa a la pantalla de inicio de sesión"
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        ),
        tabBarButton: HapticTab,
        tabBarBackground: () => null,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Buscar compañeros',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    paddingRight: 16,
    paddingLeft: 8,
    zIndex: 999,
    elevation: 10,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    // Efecto visual consistente en iOS y Android
    opacity: 1,
  },
  logoutButtonPressed: {
    opacity: 0.6,
  },
});