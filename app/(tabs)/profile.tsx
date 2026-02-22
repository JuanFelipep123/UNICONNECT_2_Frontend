import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1E293B',
    label: '#64748B',
    border: '#E2E8F0',
    primary: '#00284D',
    gold: '#C5A059',
  },
  dark: {
    background: '#F8F9FA',
    surface: '#1E293B',
    text: '#F1F5F9',
    label: '#94A3B8',
    border: '#334155',
    primary: '#00284D',
    gold: '#C5A059',
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Mi Perfil</Text>
        <Text style={[styles.subtitle, { color: theme.label }]}>
          Información académica y general
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/profile/edit')}
      >
        <Text style={[styles.buttonText, { color: theme.gold }]}>
          Editar Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});