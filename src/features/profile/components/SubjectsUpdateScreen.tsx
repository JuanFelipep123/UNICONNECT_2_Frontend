/**
 * Pantalla de actualizar materias
 * Evita antipatrones:
 * - Usa hooks para la lógica (useSubjectsManager, useSubjectsSave)
 * - Componentes memoizados
 * - Tema centralizado
 * - Manejo de errores centralizado
 */
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSubjectsManager } from '../hooks/useSubjectsManager';
import { useSubjectsSave } from '../hooks/useSubjectsSave';
import { useLoadProfileSubjects } from '../hooks/useLoadProfileSubjects';
import { useLoadAvailableSubjects } from '../hooks/useLoadAvailableSubjects';
import { profileHttpService } from '../../../services/profileHttpService';
import { SubjectChip } from './SubjectChip';
import { SubjectItem } from './SubjectItem';
import { LIGHT_THEME } from '../../../theme/themeContext';

export const SubjectsUpdateScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const colors = LIGHT_THEME;

  // State para controlar materias siendo agregadas
  const [addingSubjectIds, setAddingSubjectIds] = useState<Set<string>>(new Set());
  const [removingSubjectIds, setRemovingSubjectIds] = useState<Set<string>>(new Set());
  const [addingError, setAddingError] = useState<string | null>(null);

  // Credenciales
  const token = process.env.EXPO_PUBLIC_API_TOKEN || '';
  const profileId = process.env.EXPO_PUBLIC_TEST_USER_ID || '';

  // Cargar materias del perfil y disponibles
  const { subjects: profileSubjects, loading: loadingProfile, error: errorProfile, reload: reloadProfile } = 
    useLoadProfileSubjects(profileId, token);
  
  const { subjects: availableSubjects, loading: loadingAvailable, error: errorAvailable, reload: reloadAvailable } = 
    useLoadAvailableSubjects(token);

  // Usar los datos del backend o fallback a parámetros si están disponibles
  const initialSubjects = useMemo(() => {
    if (profileSubjects.length > 0) {
      return profileSubjects;
    }
    // Fallback a parámetros si no hay datos del backend
    try {
      if (params.initialSubjects) {
        return JSON.parse(params.initialSubjects as string);
      }
    } catch {
      console.error('Error al parsear subjects iniciales');
    }
    return [];
  }, [profileSubjects, params.initialSubjects]);

  const {
    currentSubjects,
    filteredSubjects,
    searchQuery,
    addSubject,
    removeSubject,
    setSearchQuery,
  } = useSubjectsManager(initialSubjects, availableSubjects);

  const { saving, error: savingError, saveSubjects, clearError } = useSubjectsSave();

  // Handlers memoizados
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(async () => {
    console.log('[SubjectsUpdateScreen] Reintentando carga...');
    await reloadProfile();
    await reloadAvailable();
  }, [reloadProfile, reloadAvailable]);

  const handleAddSubject = useCallback(
    async (subject) => {
      if (!token || !profileId) {
        setAddingError('Credenciales no disponibles');
        return;
      }

      // Agregar a la lista local inmediatamente
      addSubject(subject);
      
      // Marcar como agregando
      setAddingSubjectIds((prev) => new Set([...prev, subject.id]));
      setAddingError(null);

      try {
        console.log('[SubjectsUpdateScreen] Agregando materia al backend...');
        const response = await profileHttpService.addSubjectToProfile(
          profileId,
          subject.id,
          token
        );

        if (response.success) {
          console.log('[SubjectsUpdateScreen] ✓ Materia agregada exitosamente');
          // Mantener en la lista local
        } else {
          console.error('[SubjectsUpdateScreen] ✗ Error al agregar:', response.error);
          // Remover de la lista local si falló
          removeSubject(subject.id);
          setAddingError(response.error || 'Error al agregar materia');
          Alert.alert('Error', response.error || 'No se pudo agregar la materia');
        }
      } catch (error) {
        console.error('[SubjectsUpdateScreen] ✗ Excepción:', error);
        // Remover de la lista local si falló
        removeSubject(subject.id);
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        setAddingError(errorMsg);
        Alert.alert('Error', errorMsg);
      } finally {
        setAddingSubjectIds((prev) => {
          const next = new Set(prev);
          next.delete(subject.id);
          return next;
        });
      }
    },
    [addSubject, removeSubject, token, profileId]
  );

  const handleRemoveSubject = useCallback(
    async (subjectId: string) => {
      if (!token || !profileId) {
        setAddingError('Credenciales no disponibles');
        return;
      }

      // Remover de la lista local inmediatamente
      removeSubject(subjectId);
      
      // Marcar como eliminando
      setRemovingSubjectIds((prev) => new Set([...prev, subjectId]));
      setAddingError(null);

      try {
        console.log('[SubjectsUpdateScreen] Eliminando materia del backend...');
        const response = await profileHttpService.removeSubjectFromProfile(
          profileId,
          subjectId,
          token
        );

        if (response.success) {
          console.log('[SubjectsUpdateScreen] ✓ Materia eliminada exitosamente');
          // Mantener eliminada en la lista local
        } else {
          console.error('[SubjectsUpdateScreen] ✗ Error al eliminar:', response.error);
          // Re-agregar a la lista local si falló
          const subject = profileSubjects.find(s => s.id === subjectId);
          if (subject) {
            addSubject(subject);
          }
          setAddingError(response.error || 'Error al eliminar materia');
          Alert.alert('Error', response.error || 'No se pudo eliminar la materia');
        }
      } catch (error) {
        console.error('[SubjectsUpdateScreen] ✗ Excepción:', error);
        // Re-agregar a la lista local si falló
        const subject = profileSubjects.find(s => s.id === subjectId);
        if (subject) {
          addSubject(subject);
        }
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        setAddingError(errorMsg);
        Alert.alert('Error', errorMsg);
      } finally {
        setRemovingSubjectIds((prev) => {
          const next = new Set(prev);
          next.delete(subjectId);
          return next;
        });
      }
    },
    [removeSubject, addSubject, token, profileId, profileSubjects]
  );

  const handleSave = useCallback(async () => {
    // Los cambios ya se han guardado en tiempo real
    // Simplemente volver al menú anterior
    console.log('[SubjectsUpdateScreen] Volviendo al menú anterior...');
    router.back();
  }, [router]);

  // Renderizadores memoizados
  const renderCurrentSubject = useCallback(
    ({ item }) => {
      const isRemoving = removingSubjectIds.has(item.id);
      return (
        <SubjectChip
          id={item.id}
          name={item.name}
          onRemove={handleRemoveSubject}
          isLoading={isRemoving}
        />
      );
    },
    [handleRemoveSubject, removingSubjectIds]
  );

  const renderAvailableSubject = useCallback(
    ({ item }) => {
      const isAdding = addingSubjectIds.has(item.id);
      return (
        <SubjectItem
          name={item.name}
          department={item.program || item.department || ''}
          onAdd={() => handleAddSubject(item)}
          isLoading={isAdding}
        />
      );
    },
    [handleAddSubject, addingSubjectIds]
  );

  // Memoizar datos para lista de materias actuales
  const currentSubjectsData = useMemo(
    () => currentSubjects.map((s) => ({ ...s })),
    [currentSubjects]
  );

  // Estado de carga combinada
  const isLoading = loadingProfile || loadingAvailable;
  const loadError = errorProfile || errorAvailable;

  // Log detallado del error
  if (loadError && !isLoading) {
    console.warn('[SubjectsUpdateScreen] MOSTRANDO PANTALLA DE ERROR:', {
      errorProfile,
      errorAvailable,
      loadError,
    });
  }

  // Si hay error al cargar, mostrar pantalla de error
  if (loadError && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Actualizar Materias</Text>
          </View>
        </View>
        <View style={[styles.container, styles.center, { padding: 24 }]}>
          <MaterialIcons name="error-outline" size={48} color={colors.primary} />
          <Text style={[styles.errorMessage, { marginTop: 16, marginBottom: 8 }]}>
            {loadError || 'Error desconocido'}
          </Text>
          {errorProfile && (
            <Text style={[styles.errorDetails, { marginBottom: 16 }]}>
              Error de perfil: {errorProfile}
            </Text>
          )}
          {errorAvailable && (
            <Text style={[styles.errorDetails, { marginBottom: 16 }]}>
              Error de materias: {errorAvailable}
            </Text>
          )}
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen
        options={{
          title: 'Actualizar Materias',
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Actualizar Materias</Text>
        </View>
      </View>

      {/* Contenido principal */}
      {isLoading ? (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando materias...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
        {/* Sección: Materias Actuales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.gold }]}>
              Mis Materias Actuales
            </Text>
            <Text style={styles.sectionSubtitle}>
              Elimina las materias que ya no estés cursando
            </Text>
          </View>

          {currentSubjectsData.length === 0 ? (
            <Text style={styles.emptyText}>No hay materias agregadas</Text>
          ) : (
            <View style={styles.chipContainer}>
              {currentSubjectsData.map((item) => renderCurrentSubject({ item }))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Sección: Buscar y Añadir */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>
            Buscar y Añadir
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.gold}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar nuevas materias..."
              placeholderTextColor={colors.label}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Lista de Materias Disponibles */}
          <View style={styles.subjectsList}>
            {filteredSubjects.length === 0 ? (
              <Text style={styles.noResultsText}>
                {searchQuery
                  ? 'No se encontraron materias'
                  : 'Todas las materias están agregadas'}
              </Text>
            ) : (
              <FlatList
                data={filteredSubjects}
                renderItem={renderAvailableSubject}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>

        {/* Mostrar error si existe */}
        {savingError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{savingError}</Text>
            <TouchableOpacity onPress={clearError}>
              <MaterialIcons name="close" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      )}

      {/* Botón Guardar - Fixed Bottom */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={20} color={colors.gold} />
              <Text style={[styles.saveButtonText, { color: colors.gold }]}>
                Guardar Cambios
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  chipContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  columnWrapper: {
    gap: 8,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  subjectsList: {
    marginTop: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
  },
  errorMessage: {
    marginTop: 16,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
