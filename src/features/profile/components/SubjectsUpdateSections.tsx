import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { type Subject } from '../../../services/profileHttpService';
import { LIGHT_THEME, type ThemeColors } from '../../../theme/themeContext';
import { SubjectChip } from './SubjectChip';
import { SubjectItem } from './SubjectItem';
import { subjectsUpdateStyles as styles } from './subjectsUpdateStyles';

interface CurrentSubjectsSectionProps {
  colors: ThemeColors;
  currentSubjects: Subject[];
  removingSubjectIds: Set<string>;
  onRemoveSubject: (subjectId: string) => void;
  isOnboarding?: boolean;
}

export const CurrentSubjectsSection = memo<CurrentSubjectsSectionProps>(
  ({ colors, currentSubjects, removingSubjectIds, onRemoveSubject, isOnboarding = false }) => {
    return (
      <View style={styles.section}>
        {!isOnboarding ? (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.gold }]}>Mis Materias Actuales</Text>
            <Text style={styles.sectionSubtitle}>Elimina las materias que ya no estes cursando</Text>
          </View>
        ) : null}

        {currentSubjects.length === 0 ? (
          <Text style={styles.emptyText}>Aun no has agregado materias.</Text>
        ) : (
          <View style={styles.chipContainer}>
            {currentSubjects.map((subject) => (
              <SubjectChip
                key={subject.id}
                id={subject.id}
                name={subject.name}
                onRemove={onRemoveSubject}
                isLoading={removingSubjectIds.has(subject.id)}
                variant={isOnboarding ? 'onboarding' : 'default'}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

CurrentSubjectsSection.displayName = 'CurrentSubjectsSection';

interface OnboardingSubjectsContentProps {
  colors: ThemeColors;
  currentSubjects: Subject[];
  filteredSubjects: Subject[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  addingSubjectIds: Set<string>;
  removingSubjectIds: Set<string>;
  onAddSubject: (subject: Subject) => void;
  onRemoveSubject: (subjectId: string) => void;
  inlineErrorMessage?: string | null;
  onClearInlineError?: () => void;
}

export const OnboardingSubjectsContent = memo<OnboardingSubjectsContentProps>(
  ({
    colors,
    currentSubjects,
    filteredSubjects,
    searchQuery,
    onSearchQueryChange,
    addingSubjectIds,
    removingSubjectIds,
    onAddSubject,
    onRemoveSubject,
    inlineErrorMessage,
    onClearInlineError,
  }) => {
    return (
      <View style={styles.section}>
        <View style={[styles.searchBarContainer, styles.searchBarContainerOnboarding]}>
          <MaterialIcons name="search" size={20} color={colors.gold} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, styles.searchInputOnboarding, { color: colors.text }]}
            placeholder="Buscar materias (ej. Fisica, Biologia)..."
            placeholderTextColor={colors.label}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
          />
        </View>

        {inlineErrorMessage ? (
          <ErrorBanner message={inlineErrorMessage} onClose={onClearInlineError || (() => undefined)} />
        ) : null}

        {currentSubjects.length === 0 ? (
          <Text style={styles.emptyText}>Aun no has agregado materias.</Text>
        ) : (
          <View style={[styles.chipContainer, styles.onboardingChipContainer]}>
            {currentSubjects.map((subject) => (
              <SubjectChip
                key={subject.id}
                id={subject.id}
                name={subject.name}
                onRemove={onRemoveSubject}
                isLoading={removingSubjectIds.has(subject.id)}
                variant="onboarding"
              />
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, styles.onboardingSectionTitle]}>SUGERENCIAS PARA TU CARRERA</Text>

        <View style={styles.subjectsList}>
          {filteredSubjects.length === 0 ? (
            <Text style={styles.noResultsText}>
              {searchQuery ? 'No se encontraron materias' : 'Todas las materias estan agregadas'}
            </Text>
          ) : (
            <FlatList
              data={filteredSubjects}
              renderItem={({ item }) => (
                <SubjectItem
                  name={item.name}
                  department={item.program || item.department || ''}
                  onAdd={() => onAddSubject(item)}
                  isLoading={addingSubjectIds.has(item.id)}
                  variant="onboarding"
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    );
  }
);

OnboardingSubjectsContent.displayName = 'OnboardingSubjectsContent';

interface AvailableSubjectsSectionProps {
  colors: ThemeColors;
  filteredSubjects: Subject[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  addingSubjectIds: Set<string>;
  onAddSubject: (subject: Subject) => void;
  isOnboarding?: boolean;
}

export const AvailableSubjectsSection = memo<AvailableSubjectsSectionProps>(
  ({
    colors,
    filteredSubjects,
    searchQuery,
    onSearchQueryChange,
    addingSubjectIds,
    onAddSubject,
    isOnboarding = false,
  }) => {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isOnboarding ? styles.onboardingSectionTitle : { color: colors.gold }]}>
          {isOnboarding ? 'SUGERENCIAS PARA TU CARRERA' : 'Buscar y Anadir'}
        </Text>

        <View style={[styles.searchBarContainer, isOnboarding && styles.searchBarContainerOnboarding]}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.gold}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, isOnboarding && styles.searchInputOnboarding, { color: colors.text }]}
            placeholder={isOnboarding ? 'Buscar materias (ej. Fisica, Biologia)...' : 'Buscar nuevas materias...'}
            placeholderTextColor={colors.label}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
          />
        </View>

        <View style={styles.subjectsList}>
          {filteredSubjects.length === 0 ? (
            <Text style={styles.noResultsText}>
              {searchQuery ? 'No se encontraron materias' : 'Todas las materias están agregadas'}
            </Text>
          ) : (
            <FlatList
              data={filteredSubjects}
              renderItem={({ item }) => (
                <SubjectItem
                  name={item.name}
                  department={item.program || item.department || ''}
                  onAdd={() => onAddSubject(item)}
                  isLoading={addingSubjectIds.has(item.id)}
                  variant={isOnboarding ? 'onboarding' : 'default'}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    );
  }
);

AvailableSubjectsSection.displayName = 'AvailableSubjectsSection';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export const ErrorBanner = memo<ErrorBannerProps>(({ message, onClose }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <MaterialIcons name="close" size={20} color={LIGHT_THEME.error} />
      </TouchableOpacity>
    </View>
  );
});

ErrorBanner.displayName = 'ErrorBanner';
