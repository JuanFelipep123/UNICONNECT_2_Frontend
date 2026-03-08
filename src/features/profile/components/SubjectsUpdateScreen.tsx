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
    OnboardingSubjectsContent,
} from './SubjectsUpdateSections';
import { subjectsUpdateStyles as styles } from './subjectsUpdateStyles';

interface SubjectsUpdateScreenProps {
  isOnboarding?: boolean;
}

export const SubjectsUpdateScreen = ({ isOnboarding = false }: SubjectsUpdateScreenProps) => {
  const insets = useSafeAreaInsets();
  const colors = LIGHT_THEME;

  const {
    currentSubjects,
    filteredSubjects,
    searchQuery,
    setSearchQuery,
    onboardingEmptySuggestionMessage,
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
  } = useSubjectsUpdateController(isOnboarding);

  if (loadError && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={[styles.header, isOnboarding ? styles.headerOnboarding : null, { backgroundColor: colors.primary }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.surface} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isOnboarding ? styles.headerTitleOnboarding : null]}>
              {isOnboarding ? 'SELECCIONA TUS MATERIAS' : 'Actualizar Materias'}
            </Text>
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

      <View style={[styles.header, isOnboarding ? styles.headerOnboarding : null, { backgroundColor: colors.primary }]}> 
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isOnboarding ? styles.headerTitleOnboarding : null]}>
            {isOnboarding ? 'SELECCIONA TUS MATERIAS' : 'Actualizar Materias'}
          </Text>
        </View>
      </View>

      {isOnboarding ? (
        <View style={styles.onboardingHeroContainer}>
          <Text style={styles.onboardingStepLabel}>PASO 2 DE 2</Text>
          <View style={styles.onboardingDotsRow}>
            <View style={[styles.onboardingDot, styles.onboardingDotInactive]} />
            <View style={styles.onboardingDotPill}>
              <View style={[styles.onboardingDot, styles.onboardingDotActive]} />
            </View>
          </View>
          <Text style={styles.onboardingDescription}>
            Agrega tus cursos actuales para que tus companeros puedan encontrarte y colaborar contigo.
          </Text>
        </View>
      ) : null}

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
          {isOnboarding ? (
            <OnboardingSubjectsContent
              colors={colors}
              currentSubjects={currentSubjects}
              filteredSubjects={filteredSubjects}
              searchQuery={searchQuery}
              emptySuggestionMessage={onboardingEmptySuggestionMessage}
              onSearchQueryChange={setSearchQuery}
              addingSubjectIds={addingSubjectIds}
              removingSubjectIds={removingSubjectIds}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
              inlineErrorMessage={addingError}
              onClearInlineError={() => setAddingError(null)}
            />
          ) : (
            <>
              <CurrentSubjectsSection
                colors={colors}
                currentSubjects={currentSubjects}
                removingSubjectIds={removingSubjectIds}
                onRemoveSubject={handleRemoveSubject}
                isOnboarding={false}
              />

              <View style={styles.divider} />

              <AvailableSubjectsSection
                colors={colors}
                filteredSubjects={filteredSubjects}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                addingSubjectIds={addingSubjectIds}
                onAddSubject={handleAddSubject}
                isOnboarding={false}
              />
            </>
          )}

          {savingError && <ErrorBanner message={savingError} onClose={clearError} />}
          {!isOnboarding && addingError && <ErrorBanner message={addingError} onClose={() => setAddingError(null)} />}
        </ScrollView>
      )}

      <View
        style={[
          styles.buttonContainer,
          isOnboarding ? styles.buttonContainerOnboarding : null,
          { paddingBottom: isOnboarding ? (insets.bottom > 0 ? insets.bottom : 0) : (insets.bottom > 0 ? insets.bottom : 16) },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, isOnboarding ? styles.saveButtonOnboarding : null, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {!isOnboarding ? <MaterialIcons name="check-circle" size={20} color="#FFFFFF" /> : null}
              <Text style={[styles.saveButtonText, isOnboarding ? styles.saveButtonTextOnboarding : null, { color: '#FFFFFF' }]}>
                {isOnboarding ? 'FINALIZAR REGISTRO' : 'Guardar Cambios'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
