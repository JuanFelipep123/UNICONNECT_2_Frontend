import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SubjectsSectionProps {
  subjects: string[];
  onAddSubject?: () => void;
  onRemoveSubject?: (index: number) => void;
}

const colors = {
  primary: '#00284D',
  gold: '#C5A059',
  surface: '#FFFFFF',
};

export const SubjectsSection: React.FC<SubjectsSectionProps> = ({
  subjects,
  onAddSubject,
  onRemoveSubject,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.gold }]}>
          Materias Actuales
        </Text>
        <TouchableOpacity onPress={onAddSubject} style={styles.addButton}>
          <MaterialIcons name="add-circle-outline" size={22} color={colors.gold} />
          <Text style={[styles.addButtonText, { color: colors.gold }]}>
            Añadir
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subjectsList}>
        {subjects.length === 0 ? (
          <Text style={styles.emptyText}>No hay materias registradas</Text>
        ) : (
          subjects.map((subject, index) => (
            <View key={`subject-${index}`} style={styles.subjectTag}>
              <Text style={styles.subjectText}>{subject}</Text>
              <TouchableOpacity
                onPress={() => onRemoveSubject?.(index)}
                style={styles.closeButton}
              >
                <MaterialIcons name="cancel" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Gris muy claro para el fondo
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectText: {
    fontSize: 13,
    color: '#334155', // Texto oscuro para lectura
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 13,
  }
});