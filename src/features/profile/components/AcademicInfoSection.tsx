import { Picker } from '@react-native-picker/picker';
import React from 'react';
import {
    StyleSheet,
    Text,
    useColorScheme,
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
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    label: '#94A3B8',
    border: '#334155',
    primary: '#00284D',
    gold: '#C5A059',
  },
};

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  career,
  semester,
  onCareerChange,
  onSemesterChange,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.gold }]}>
        Información Académica
      </Text>

      {/* Carrera */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.label }]}>Carrera</Text>
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Picker
            selectedValue={career}
            onValueChange={onCareerChange}
            style={[styles.picker, { color: theme.text }]}
            dropdownIconColor={theme.gold}
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
        <Text style={[styles.label, { color: theme.label }]}>
          Semestre Actual
        </Text>
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Picker
            selectedValue={semester}
            onValueChange={onSemesterChange}
            style={[styles.picker, { color: theme.text }]}
            dropdownIconColor={theme.gold}
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
