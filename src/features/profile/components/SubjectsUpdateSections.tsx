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
}

export const CurrentSubjectsSection = memo<CurrentSubjectsSectionProps>(
  ({ colors, currentSubjects, removingSubjectIds, onRemoveSubject }) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>Mis Materias Actuales</Text>
          <Text style={styles.sectionSubtitle}>Elimina las materias que ya no estés cursando</Text>
        </View>

        {currentSubjects.length === 0 ? (
          <Text style={styles.emptyText}>No hay materias agregadas</Text>
        ) : (
          <View style={styles.chipContainer}>
            {currentSubjects.map((subject) => (
              <React.Fragment key={subject.id}>
                <SubjectChip
                  id={subject.id}
                  name={subject.name}
                  onRemove={onRemoveSubject}
                  isLoading={removingSubjectIds.has(subject.id)}
                />
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  }
);

CurrentSubjectsSection.displayName = 'CurrentSubjectsSection';

interface AvailableSubjectsSectionProps {
  colors: ThemeColors;
  filteredSubjects: Subject[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  addingSubjectIds: Set<string>;
  onAddSubject: (subject: Subject) => void;
}

export const AvailableSubjectsSection = memo<AvailableSubjectsSectionProps>(
  ({
    colors,
    filteredSubjects,
    searchQuery,
    onSearchQueryChange,
    addingSubjectIds,
    onAddSubject,
  }) => {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.gold }]}>Buscar y Añadir</Text>

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
