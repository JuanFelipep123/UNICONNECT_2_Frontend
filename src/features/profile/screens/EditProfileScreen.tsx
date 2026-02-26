import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView, // Añadido para manejo de teclado
  Platform,             // Añadido para detectar SO
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // Ajustado
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
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets(); // Hook para áreas seguras

  const initialData = React.useMemo(() => {
    return params.initialData 
      ? JSON.parse(params.initialData as string) 
      : undefined;
  }, [params.initialData]);

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
  } = useProfileForm(initialData);

  const handleSave = async () => {
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
    // KeyboardAvoidingView asegura que el teclado no tape los inputs en iOS
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']} // Dejamos el bottom para el contenedor del botón
      >
        <Stack.Screen
          options={{
            title: isOnboarding ? 'Completar Registro' : 'Editar Perfil',
            headerStyle: { backgroundColor: theme.primary },
            headerTintColor: '#fff',
          }}
        />

        <ScrollView
          style={styles.scrollView}
          // Ajustamos el padding bottom dinámicamente para que el botón no tape el contenido final
          contentContainerStyle={[
            styles.content, 
            { paddingBottom: 100 + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.section}>
            <AcademicInfoSection
              career={profile.carrera}
              semester={profile.semestre}
              onCareerChange={updateCareer}
              onSemesterChange={updateSemester}
            />
          </View>

          <View style={styles.section}>
            <ContactInfoSection
              phone={profile.celular || ''}
              onPhoneChange={updatePhone}
            />
          </View>

          <View style={styles.section}>
            <SubjectsSection
              subjects={(profile.materias || []).map((s) => s?.name || '')} 
              onAddSubject={() => addSubject('Nueva Materia')}
              onRemoveSubject={(index: number) => {
                const subject = (profile.materias || [])[index];
                if (subject?.id) removeSubject(subject.id);
              }}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Contenedor del botón con margen dinámico para iPhone */}
        <View style={[
          styles.buttonContainer, 
          { 
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
            backgroundColor: theme.background 
          }
        ]}>
          <SaveButton onPress={handleSave} loading={loading} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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