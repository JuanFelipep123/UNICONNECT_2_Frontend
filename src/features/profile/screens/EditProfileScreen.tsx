import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AcademicInfoSection } from '../components/AcademicInfoSection';
import { ContactInfoSection } from '../components/ContactInfoSection';
import { ProfileHeader } from '../components/ProfileHeader';
import { SaveButton } from '../components/SaveButton';
import { SubjectsSection } from '../components/SubjectsSection';
import { useProfileForm } from '../hooks/useProfileForm';
import { useProfileLoad } from '../hooks/useProfileLoad';
import { useLoadProfileSubjects } from '../hooks/useLoadProfileSubjects';
import { useAuthStore } from '../../../store/authStore';
import { getErrorMessage, parseError } from '../../../utils/errorHandler';
import { LIGHT_THEME } from '../../../theme/themeContext';

export const EditProfileScreen = ({ isOnboarding = false }) => {
  const theme = LIGHT_THEME;
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { userId, token } = useAuthStore();

  // Memoizar datos iniciales para evitar recomputación
  const initialData = useMemo(() => {
    try {
      return params.initialData ? JSON.parse(params.initialData as string) : undefined;
    } catch (error) {
      console.error('Error al parsear datos iniciales:', error);
      return undefined;
    }
  }, [params.initialData]);

  const {
    profile,
    loading,
    error,
    updateCareer,
    updateSemester,
    updateAvatar,
    updatePhone,
    removeSubject,
    saveProfile,
  } = useProfileForm(initialData);

  const { loadProfile } = useProfileLoad();
  const { subjects: profileSubjects, loading: subjectsLoading, reload: reloadSubjects } = useLoadProfileSubjects(
    userId || '',
    token || ''
  );

  // Refresca el perfil y materias cuando la pantalla enfoca
  // Esto asegura que los cambios de materias desde SubjectsUpdateScreen se reflejen
  useFocusEffect(
    useCallback(() => {
      console.log('[EditProfileScreen] Pantalla enfocada - cargando datos...');
      loadProfile();
      if (userId && token) {
        reloadSubjects();
      }
    }, [loadProfile, reloadSubjects, userId, token])
  );

  // Log para confirmar materias
  useMemo(() => {
    if (profileSubjects.length > 0) {
      console.log('[EditProfileScreen] Materias cargadas del backend:', profileSubjects.length, 'items');
      console.log('[EditProfileScreen] Materias:', profileSubjects);
    }
  }, [profileSubjects]);

  // Separar lógica de manejo de guardado
  const handleSave = useCallback(async () => {
    const success = await saveProfile();
    if (success) {
      Alert.alert('¡Éxito!', 'Información actualizada correctamente');
      if (isOnboarding) {
        router.replace('/(tabs)' as any);
      } else {
        router.back();
      }
    } else {
      const appError = parseError({ message: error });
      const errorMessage = getErrorMessage(appError);
      Alert.alert('Error', errorMessage);
    }
  }, [saveProfile, error, isOnboarding, router]);

  if (loading && !profile.name) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']}
      >
        <Stack.Screen
          options={{
            title: isOnboarding ? 'Completar Registro' : 'Editar Perfil',
            headerStyle: { backgroundColor: theme.primary },
            headerTintColor: '#fff',
          }}
        />

        {/* Contenedor principal con flex para distribuir el espacio */}
        <View style={styles.mainContainer}>
          {/* ScrollView flexible que cede espacio al botón */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ProfileHeader
              avatarUrl={profile.avatar_url || ''}
              onAvatarChange={updateAvatar}
            />
            
            <View style={styles.readOnlyContainer}>
              <Text style={styles.userName}>
                {profile.name || 'Usuario'}
              </Text>
              <Text style={styles.readOnlyLabel}>Datos validados por la cuenta</Text>
            </View>

            <View style={styles.section}>
              <AcademicInfoSection
                career={profile.career || ''}
                semester={profile.semester || 1}
                onCareerChange={updateCareer}
                onSemesterChange={updateSemester}
              />
            </View>

            <View style={styles.section}>
              <ContactInfoSection
                phone={profile.phone_number || ''}
                onPhoneChange={updatePhone}
              />
            </View>

            <View style={styles.section}>
              {subjectsLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <SubjectsSection
                  subjects={profileSubjects.map((s) => s?.name || '')}
                  canRemove={false}
                  onAddSubject={() => {
                    router.push({
                      pathname: '/profile/subjects-update',
                      params: { 
                        initialSubjects: JSON.stringify(profileSubjects),
                        isEditing: 'true'
                      }
                    } as any);
                  }}
                  onRemoveSubject={(index: number) => {
                    const subject = profileSubjects[index];
                    if (subject?.id) removeSubject(subject.id);
                  }}
                />
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Botón fijo en la parte inferior - siempre visible */}
          <View style={[
            styles.buttonContainer, 
            { 
              paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20,
              backgroundColor: theme.background,
            }
          ]}>
            <SaveButton onPress={handleSave} loading={loading} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 0,
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollView: { 
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingTop: 12,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  readOnlyContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  readOnlyLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
});