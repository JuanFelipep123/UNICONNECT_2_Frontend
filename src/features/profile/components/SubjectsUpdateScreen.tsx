import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LIGHT_THEME } from '../../../theme/themeContext';
import { useSubjectsUpdateController } from '../hooks/useSubjectsUpdateController';
import {
    AvailableSubjectsSection,
    CurrentSubjectsSection,
    ErrorBanner,
} from './SubjectsUpdateSections';
import { subjectsUpdateStyles as styles } from './subjectsUpdateStyles';

export const SubjectsUpdateScreen = () => {
  const insets = useSafeAreaInsets();
  const colors = LIGHT_THEME;

  const {
    currentSubjects,
    filteredSubjects,
    searchQuery,
    setSearchQuery,
    addingSubjectIds,
    removingSubjectIds,
    addingError,
    setAddingError,
    saving,
    savingError,
    clearError,
    handleGoBack,
    handleRetry,
    handleAddSubject,
    handleRemoveSubject,
    handleSave,
    isLoading,
    loadError,
    errorProfile,
    errorAvailable,
  } = useSubjectsUpdateController();

  if (loadError && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.surface} />
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
            <Text style={[styles.errorDetails, { marginBottom: 16 }]}>Error de perfil: {errorProfile}</Text>
          )}
          {errorAvailable && (
            <Text style={[styles.errorDetails, { marginBottom: 16 }]}>Error de materias: {errorAvailable}</Text>
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

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Actualizar Materias</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando materias...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <CurrentSubjectsSection
            colors={colors}
            currentSubjects={currentSubjects}
            removingSubjectIds={removingSubjectIds}
            onRemoveSubject={handleRemoveSubject}
          />

          <View style={styles.divider} />

          <AvailableSubjectsSection
            colors={colors}
            filteredSubjects={filteredSubjects}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            addingSubjectIds={addingSubjectIds}
            onAddSubject={handleAddSubject}
          />

          {savingError && <ErrorBanner message={savingError} onClose={clearError} />}
          {addingError && <ErrorBanner message={addingError} onClose={() => setAddingError(null)} />}
        </ScrollView>
      )}

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
              <Text style={[styles.saveButtonText, { color: colors.gold }]}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
