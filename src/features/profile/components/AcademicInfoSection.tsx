import { Picker } from '@react-native-picker/picker';
import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CAREERS, SEMESTERS } from '../types/profile';

interface AcademicInfoSectionProps {
  career: string;
  semester: number;
  onCareerChange: (value: string) => void;
  onSemesterChange: (value: number) => void;
}

const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1E293B',
  label: '#64748B',
  border: '#E2E8F0',
  primary: '#00284D',
  gold: '#C5A059',
};

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  career,
  semester,
  onCareerChange,
  onSemesterChange,
}) => {
  const theme = colors;

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
            styles.pickerContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Picker
            selectedValue={career}
            onValueChange={onCareerChange}
            style={[styles.picker, { color: colors.text }]}
            dropdownIconColor={colors.gold}
          >
            <Picker.Item label="Selecciona una carrera" value="" />
            {CAREERS.map((c) => (
              <Picker.Item key={c.value} label={c.label} value={c.value} />
            ))}
          </Picker>
        </View>
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
            selectedValue={semester}
            onValueChange={onSemesterChange}
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
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
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
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 56,
  },
});
