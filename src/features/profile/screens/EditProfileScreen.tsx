import { Stack, router } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { AcademicInfoSection } from '../components/AcademicInfoSection';
import { ProfileHeader } from '../components/ProfileHeader';
import { SaveButton } from '../components/SaveButton';
import { SubjectsSection } from '../components/SubjectsSection';
import { useProfileForm } from '../hooks/useProfileForm';

const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1E293B',
    label: '#64748B',
    border: '#E2E8F0',
    primary: '#00284D',
    gold: '#C5A059',
    error: '#DC2626',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    label: '#94A3B8',
    border: '#334155',
    primary: '#00284D',
    gold: '#C5A059',
    error: '#EF4444',
  },
};

interface EditProfileScreenProps {
  isOnboarding?: boolean; // Indica si es el primer completado o edición
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  isOnboarding = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  const { markProfileAsComplete } = useAuthStore();

  const {
    profile,
    loading,
    error,
    updateCareer,
    updateSemester,
    updateAvatar,
    addSubject,
    removeSubject,
    saveProfile,
  } = useProfileForm();

  const handleSave = async () => {
    const success = await saveProfile();

    if (success) {
      Alert.alert(
        '¡Éxito!',
        isOnboarding
          ? 'Perfil completado. ¡Bienvenido a UniConnect!'
          : 'Perfil actualizado correctamente'
      );

      if (isOnboarding) {
        markProfileAsComplete();
        router.replace('/(tabs)');
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', error || 'No se pudo guardar el perfil');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isOnboarding ? 'Completar Registro' : 'Editar Perfil',
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { color: '#fff', fontWeight: '600' },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <ProfileHeader
          avatarUrl={profile.avatar}
          onAvatarChange={updateAvatar}
        />

        {/* Sección de información académica */}
        <View style={styles.section}>
          <AcademicInfoSection
            career={profile.career}
            semester={profile.semester}
            onCareerChange={updateCareer}
            onSemesterChange={updateSemester}
          />
        </View>

        {/* Sección de materias */}
        <View style={styles.section}>
          <SubjectsSection
            subjects={profile.subjects.map((s: any) => s?.name ?? s?.title ?? String(s))}
            onAddSubject={() => addSubject('')}
            onRemoveSubject={(index: number) => {
              const subject = profile.subjects[index];
              if (subject?.id) {
                removeSubject(subject.id);
              }
            }}
          />
        </View>

        {/* Mensajes de error */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error}
            </Text>
          </View>
        )}

        {isOnboarding && (
          <View style={[styles.infoContainer, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.infoText, { color: theme.primary }]}>
              Por favor completa tu información académica para continuar.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante guardar */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.background }]}>
        <SaveButton
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
