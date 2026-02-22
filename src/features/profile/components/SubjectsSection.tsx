import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

interface SubjectsSectionProps {
  subjects: string[];
  onAddSubject?: () => void;
  onRemoveSubject?: (index: number) => void;
}

const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1E293B',
    label: '#64748B',
    border: '#E2E8F0',
    primary: '#00284D',
    gold: '#C5A059',
  },
  dark: {
    background: '#F8F9FA',
    surface: '#F8F9FA',
    text: '#F1F5F9',
    label: '#94A3B8',
    border: '#334155',
    primary: '#00284D',
    gold: '#C5A059',
  },
};

export const SubjectsSection: React.FC<SubjectsSectionProps> = ({
  subjects,
  onAddSubject,
  onRemoveSubject,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'light' ? colors.light : colors.dark;

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.gold }]}>
          Materias Actuales
        </Text>
        <TouchableOpacity onPress={onAddSubject} style={styles.addButton}>
          <MaterialIcons name="add-circle-outline" size={20} color={theme.gold} />
          <Text style={[styles.addButtonText, { color: theme.gold }]}>
            Añadir Materia
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subjectsList}>
        {subjects.map((subject, index) => (
          <View
            key={index}
            style={[
              styles.subjectTag,
              {
                backgroundColor: '#F8F9FA', 
                borderColor: `${theme.primary}33`,
              },
            ]}
          >
            <Text style={[styles.subjectText, { color: '#F8F9FA' }]}>
              {subject}
            </Text>
            <TouchableOpacity
              onPress={() => onRemoveSubject?.(index)}
              style={styles.closeButton}
            >
              <MaterialIcons
                name="close"
                size={18}
                color={`${'#F8F9FA'}99`}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Playfair Display',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
  },
});
