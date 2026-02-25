import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProfileInfoItem } from '../components/ProfileInfoItem';
import { SectionHeader } from '../components/SectionHeader';
import { SubjectsDisplay } from '../components/SubjectsDisplay';
import { ProfileData } from '../types/profile';
import { profileService } from '../../../services/profileService';

const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1E293B',
  label: '#64748B',
  border: '#E2E8F0',
  primary: '#00284D',
  gold: '#C5A059',
};

interface ProfileViewScreenProps {
  profileData?: ProfileData;
}

export const ProfileViewScreen: React.FC<ProfileViewScreenProps> = ({
  profileData,
}) => {
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(profileData || null);
  const [loading, setLoading] = useState<boolean>(!profileData);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        /** * LÓGICA TEMPORAL (.env)
         * Extraemos el token y el ID del archivo .env para simular el login.
         */
        const token = process.env.EXPO_PUBLIC_API_TOKEN;
        const userId = process.env.EXPO_PUBLIC_TEST_USER_ID;

        if (!token || !userId) {
          Alert.alert(
            'Error de Configuración', 
            'No se encontraron las variables EXPO_PUBLIC_API_TOKEN o EXPO_PUBLIC_TEST_USER_ID en el archivo .env'
          );
          setLoading(false);
          return;
        }

        // Llamada al servicio con la IP dinámica (configurada en el service)
        const response = await profileService.getProfileById(userId, token);
        
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          Alert.alert('Aviso del Servidor', response.error || 'No se encontró el perfil');
        }
      } catch (error) {
        console.error('Error en carga de perfil:', error);
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor Express');
      } finally {
        setLoading(false);
      }
    };

    if (!profileData) {
      loadProfileData();
    }
  }, [profileData]);

  // Pantalla de carga profesional
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.label }}>Cargando datos reales...</Text>
      </View>
    );
  }

  // Estado de error si no hay datos
  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={48} color={colors.label} />
        <Text style={{ marginTop: 10, color: colors.label }}>Perfil no disponible</Text>
      </View>
    );
  }

  const careerDisplay = profile.carrera || 'No especificado';
  const semesterDisplay = profile.semestre 
    ? `${profile.semestre}º Semestre`
    : 'No especificado';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Mi Perfil Universitario',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de Perfil con datos del Backend */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { borderColor: colors.surface }]}>
            <Image
              source={{ uri: profile.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.name, { color: colors.primary }]}>
            {profile.nombre || 'Estudiante'}
          </Text>
          <Text style={[styles.university, { color: colors.label }]}>
            {profile.universidad || 'Universidad de Caldas'}
          </Text>
        </View>

        {/* Sección Académica */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Información Académica" />
          <ProfileInfoItem
            icon="school"
            label="Programa"
            value={careerDisplay}
          />
          <ProfileInfoItem
            icon="calendar-today"
            label="Semestre Actual"
            value={semesterDisplay}
          />
        </View>

        {/* Información de Contacto */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Información de Contacto" />
          <ProfileInfoItem
            icon="phone"
            label="Teléfono"
            value={profile.celular || 'No especificado'} 
          />
        </View>

        {/* Materias Actuales (US-003) */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Materias Actuales" />
          <SubjectsDisplay subjects={profile.materias || []} />
        </View>
      </ScrollView>
        
      {/* Botón Editar Perfil (US-004) */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/profile/edit' as any)}
          activeOpacity={0.9}
        >
          <MaterialIcons name="edit" size={20} color={colors.gold} />
          <Text style={[styles.editButtonText, { color: colors.gold }]}>
            EDITAR PERFIL
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  university: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});






/*
export const ProfileViewScreen: React.FC<ProfileViewScreenProps> = ({
  profileData,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState(profileData || MOCK_PROFILE_DATA);

  useEffect(() => {
    // TODO: Aquí irá la lógica para cargar datos del backend
    // const loadProfileData = async () => {
    //   const response = await profileService.getProfile();
    //   if (response.success && response.data) {
    //     setProfile(response.data);
    //   }
    // };
    // loadProfileData();
  }, []);

  const careerDisplay = profile.carrera 
    ? profile.carrera.includes('engineering') 
      ? 'Ingeniería de Sistemas'
      : profile.carrera
    : 'No especificado';

  const semesterDisplay = profile.semestre 
    ? `${profile.semestre}º Semestre`
    : 'No especificado';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Mi Perfil',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            color: '#fff', 
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { borderColor: colors.surface }]}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.name, { color: colors.primary }]}>
            {profile.nombre || 'Usuario'}
          </Text>
          <Text style={[styles.university, { color: colors.label }]}>
            {profile.universidad || 'Universidad de Caldas'}
          </Text>
        </View>

        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Información Académica" />
          <ProfileInfoItem
            icon="school"
            label="Programa"
            value={careerDisplay}
          />
          <ProfileInfoItem
            icon="calendar-today"
            label="Semestre Actual"
            value={semesterDisplay}
          />
        </View>

        {/* Información
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Información de Contacto" />
          <ProfileInfoItem
            icon="phone"
            label="Teléfono"
            value={profile.celular || 'No especificado'}
          />
        </View>

        {/* Materias Actuales 
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Materias Actuales" />
          <SubjectsDisplay subjects={profile.materias || []} />
        </View>
      </ScrollView>

      {/* Botón Editar Perfil - Fixed Footer 
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.9}
        >
          <MaterialIcons name="edit" size={20} color={colors.gold} />
          <Text style={[styles.editButtonText, { color: colors.gold }]}>
            EDITAR PERFIL
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
*/