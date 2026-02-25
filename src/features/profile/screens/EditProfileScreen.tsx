import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

export const EditProfileScreen = ({ isOnboarding = false }) => {
  const theme = colors;
  const router = useRouter();

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
    console.log("Iniciando guardado de información editable...");
    const success = await saveProfile();

    if (success) {
      Alert.alert('¡Éxito!', 'Información actualizada correctamente');
      if (isOnboarding) {
        router.replace('/(tabs)' as any);
      } else {
        router.back();
      }
    } else {
      Alert.alert('Error', error || 'No se pudo guardar los cambios');
    }
  };

  if (loading && !profile.nombre) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isOnboarding ? 'Completar Registro' : 'Editar Perfil',
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
      >
        {/* Encabezado: Foto y Nombre/Apellido (Solo lectura) */}
        <ProfileHeader
          avatarUrl={profile.avatar}
          onAvatarChange={updateAvatar}
        />
        
        <View style={styles.readOnlyContainer}>
          <Text style={styles.userName}>
            {profile.nombre} {profile.apellido}
          </Text>
          <Text style={styles.readOnlyLabel}>Datos validados por la cuenta</Text>
        </View>

        {/* 1. Carrera y Semestre (Editable) */}
        <View style={styles.section}>
          <AcademicInfoSection
            career={profile.carrera}
            semester={profile.semestre}
            onCareerChange={updateCareer}
            onSemesterChange={updateSemester}
          />
        </View>

        {/* 2. Número de Teléfono (Editable) */}
        <View style={styles.section}>
          <ContactInfoSection
            phone={profile.celular || ''}
            onPhoneChange={updatePhone}
          />
        </View>

        {/* 3. Materias (Editable - Tabla Intermedia) */}
        <View style={styles.section}>
          <SubjectsSection
            subjects={profile.materias.map((s) => s?.name || '')}
            onAddSubject={() => {
              // Aquí le pasas solo el STRING, tal como lo pide tu useCallback
              addSubject('Nueva Materia de Prueba'); 
            }}
            onRemoveSubject={(index: number) => {
              const subject = profile.materias[index];
              if (subject?.id) {
                removeSubject(subject.id);
              }
            }}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <SaveButton onPress={handleSave} loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#F8F9FA',
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