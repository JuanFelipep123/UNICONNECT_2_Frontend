import { router, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useAuthStore } from '@/src/store/authStore';

export default function TabLayout() {
  const colorScheme = 'light';
  const { clearSession, token, userId } = useAuthStore();

  useEffect(() => {
    if (!token || !userId) {
      router.replace('/');
    }
  }, [token, userId]);

  const handleLogout = useCallback(async () => {
    await clearSession();
    router.replace('/');
  }, [clearSession]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: true,
        headerLeftContainerStyle: styles.headerLeftContainer,
        headerLeft: () => (
          <Pressable
            onPress={handleLogout}
            hitSlop={10}
            style={({ pressed }) => [styles.logoutHeaderButton, pressed && styles.logoutHeaderButtonPressed]}>
            <Text style={[styles.logoutHeaderText, { color: Colors[colorScheme].tint }]}>
              Cerrar sesion
            </Text>
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
  headerLeftContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 999,
    elevation: 10,
  },
  logoutHeaderButton: {
    marginLeft: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E6F3FB',
    zIndex: 999,
    elevation: 10,
  },
  logoutHeaderButtonPressed: {
    opacity: 0.75,
  },
  logoutHeaderText: {
    fontWeight: '700',
    fontSize: 13,
  },
});