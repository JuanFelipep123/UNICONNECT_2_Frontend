import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ProfileInfoItem } from '../components/ProfileInfoItem';
import { SectionHeader } from '../components/SectionHeader';
import { SubjectsDisplay } from '../components/SubjectsDisplay';
import { ProfileData } from '../types/profile';

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
  profileData?: ProfileData & {
    name?: string;
    university?: string;
  };
}

// Datos de ejemplo (serán reemplazados por datos del backend)
const MOCK_PROFILE_DATA = {
  name: 'Laura Montoya',
  university: 'Universidad de Caldas',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrntPEfpYIAWzLVRFUsBKiolcTMr2iCspf0tRH0p9-F50wB4dzx-GJ90nXCuIDfxabbEpTSDdH6aeR0wCb0g92rbUnhOGvB3_QTdyLSEuvdhdCsfdaiVBHH4EF614exPqjUfUSjxzqcAbwUjwUx4mul8_-M-s492j7Gq2WSNUWsR56iCUxnyPtReRpAWb_dTB2Y3x736mhll5I9dJqSPxr5wxOg14_u_JCj_kaFOdq2s76OPpTpctzivaJ05xDBL3hgepYslPqukCh',
  career: 'Ingeniería de Sistemas',
  semester: 5,
  phone: '+57 300 123 4567',
  subjects: [
    { id: '1', name: 'Cálculo I' },
    { id: '2', name: 'Programación II' },
    { id: '3', name: 'Matemática Discreta' },
    { id: '4', name: 'Sistemas Lógicos' },
  ],
};

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

  const careerDisplay = profile.career 
    ? profile.career.includes('engineering') 
      ? 'Ingeniería de Sistemas'
      : profile.career
    : 'No especificado';

  const semesterDisplay = profile.semester 
    ? `${profile.semester}º Semestre`
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
        {/* Avatar y Nombre */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { borderColor: colors.surface }]}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.name, { color: colors.primary }]}>
            {profile.name || 'Usuario'}
          </Text>
          <Text style={[styles.university, { color: colors.label }]}>
            {profile.university || 'Universidad de Caldas'}
          </Text>
        </View>

        {/* Información Académica */}
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
            value={profile.phone || 'No especificado'}
          />
        </View>

        {/* Materias Actuales */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SectionHeader title="Materias Actuales" />
          <SubjectsDisplay subjects={profile.subjects || []} />
        </View>
      </ScrollView>

      {/* Botón Editar Perfil - Fixed Footer */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
