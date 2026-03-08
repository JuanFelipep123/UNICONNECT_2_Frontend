import { Picker } from '@react-native-picker/picker';
import React, { memo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SEMESTERS } from '../types/profile';

interface AcademicInfoSectionProps {
  career: string;
  semester: number;
  onSemesterChange: (value: number) => void;
}

const colors = {
  surface: '#FFFFFF',
  text: '#1F2A3C',
  label: '#6B798F',
  border: '#D5DDE8',
  gold: '#C5A059',
};

export const AcademicInfoSection = memo<AcademicInfoSectionProps>(
  ({ career, semester, onSemesterChange }) => {

    const semesterString = semester ? String(semester) : '';
    const careerString = career || '';

    // Memoizar handlers para evitar recreación innecesaria
    const handleSemesterChange = useCallback((value: string) => {
      const semesterNumber = value ? parseInt(value, 10) : 0;
      onSemesterChange(semesterNumber);
    }, [onSemesterChange]);

    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.gold }]}>
          Información Académica
        </Text>

        {/* Carrera */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.label }]}>Carrera</Text>
          <View
            style={[
              styles.readOnlyContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.readOnlyValue, { color: colors.text }]}>
              {careerString || 'No especificada'}
            </Text>
          </View>
          <Text style={styles.readOnlyHint}>La carrera no se puede modificar.</Text>
        </View>

        {/* Semestre */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.label }]}>
            Semestre Actual
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Picker
              selectedValue={semesterString}
              onValueChange={handleSemesterChange}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.gold}
            >
              {SEMESTERS.map((s) => (
                <Picker.Item
                  key={s.value}
                  label={s.label}
                  value={s.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    );
  }
);

AcademicInfoSection.displayName = 'AcademicInfoSection';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Playfair Display',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 6,
  },
  picker: {
    height: 56,
  },
  readOnlyContainer: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  readOnlyHint: {
    marginTop: 6,
    marginLeft: 8,
    fontSize: 12,
    color: '#6B798F',
    fontStyle: 'italic',
  },
});
