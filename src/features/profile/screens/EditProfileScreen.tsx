import { Stack, router } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { AcademicInfoSection } from '../components/AcademicInfoSection';
import { ContactInfoSection } from '../components/ContactInfoSection';
import { ProfileHeader } from '../components/ProfileHeader';
import { SaveButton } from '../components/SaveButton';
import { SubjectsSection } from '../components/SubjectsSection';
import { useProfileForm } from '../hooks/useProfileForm';

const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1E293B',
  label: '#64748B',
  border: '#E2E8F0',
  primary: '#00284D',
  gold: '#C5A059',
  error: '#DC2626',
};

interface EditProfileScreenProps {
  isOnboarding?: boolean; // Indica si es el primer completado o edición
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  isOnboarding = false,
}) => {
  const theme = colors;
  const { markProfileAsComplete } = useAuthStore();

  const {
    profile,
    loading,
    error,
    updateCareer,
    updateSemester,
    updateAvatar,
    updatePhone,
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
          headerRight: () => null,
          headerLeft: () => null,
          headerBackVisible: false,
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

        {/* Sección de información de contacto */}
        <View style={styles.section}>
          <ContactInfoSection
            phone={profile.phone || ''}
            onPhoneChange={updatePhone}
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
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
