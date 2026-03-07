import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../../store/authStore';
import { useAuthLogin } from '../hooks/useAuthLogin';

const LOGIN_COLORS = {
  background: '#002147',
  white: '#FFFFFF',
  card: '#F7F7F7',
  darkButton: '#03254C',
  gold: '#C6A96A',
  subtitle: '#A9B7C8',
  muted: '#6B7280',
  warning: '#B08D57',
  error: '#B00020',
};

export function LoginScreen() {
  const { canLogin, errorMessage, isLoading, handleLogin } = useAuthLogin();
  const { setSession } = useAuthStore();
  
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Mostrar Alert nativo cuando hay error
  useEffect(() => {
    if (errorMessage) {
      Alert.alert(
        '⚠️ Error de inicio de sesión',
        errorMessage,
        [{ text: 'Entendido', style: 'default' }],
        { cancelable: true }
      );
    }
  }, [errorMessage]);

  const onPressLogin = async () => {
    const user = await handleLogin();
    if (user) {
      setIsRedirecting(true); 
      setSession({ userId: user.userId, token: user.token });
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  };

  const showSpinner = isLoading || isRedirecting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="school-outline" size={44} color={LOGIN_COLORS.gold} />
          </View>
          <Text style={styles.brandTitle}>UniConnect</Text>
          <Text style={styles.brandSubtitle}>Conecta con tu comunidad universitaria</Text>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeSubtitle}>
            Inicia sesión con tu correo institucional para acceder a la plataforma.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              (pressed || showSpinner || !canLogin) && styles.googleButtonPressed,
            ]}
            onPress={onPressLogin}
            disabled={!canLogin || showSpinner}>
            {showSpinner ? (
              <View style={styles.spinnerContainer}>
                <ActivityIndicator color={LOGIN_COLORS.white} size="large" />
              </View>
            ) : (
              <View style={styles.googleButtonContent}>
                <FontAwesome name="google" size={18} color={LOGIN_COLORS.white} />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.validationRow}>
            <Ionicons name="information-circle-outline" size={14} color={LOGIN_COLORS.warning} />
            <Text style={styles.validationText}>
              Solo correos <Text style={styles.validationDomain}>@ucaldas.edu.co</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    color: LOGIN_COLORS.white,
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  brandSubtitle: {
    color: LOGIN_COLORS.subtitle,
    fontSize: 18,
    textAlign: 'center',
  },
  bottomCard: {
    backgroundColor: LOGIN_COLORS.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: LOGIN_COLORS.darkButton,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: LOGIN_COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  googleButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: LOGIN_COLORS.darkButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleButtonPressed: {
    opacity: 0.75,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spinnerContainer: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: LOGIN_COLORS.white,
    fontWeight: '700',
    fontSize: 19,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  validationText: {
    color: LOGIN_COLORS.muted,
    fontSize: 14,
  },
  validationDomain: {
    color: LOGIN_COLORS.warning,
    fontWeight: '700',
  },
});
