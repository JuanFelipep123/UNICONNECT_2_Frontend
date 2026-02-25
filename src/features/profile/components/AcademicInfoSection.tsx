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
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: '#C5A059' }]}>
        Información Académica
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Carrera</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={career}
            onValueChange={onCareerChange}
            style={styles.picker}
            dropdownIconColor="#C5A059"
          >
            <Picker.Item label="Selecciona tu carrera" value="" color="#94A3B8" />
            {CAREERS.map((c) => (
              <Picker.Item key={c.value} label={c.label} value={c.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Semestre Actual</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={semester}
            onValueChange={onSemesterChange}
            style={styles.picker}
            dropdownIconColor="#C5A059"
          >
            {SEMESTERS.map((s) => (
              <Picker.Item key={s.value} label={s.label} value={s.value} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  fieldContainer: { marginBottom: 16 },
  label: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#64748B', 
    marginBottom: 8, 
    marginLeft: 4,
    textTransform: 'uppercase' 
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden', // Importante para redondear bordes en Android
    justifyContent: 'center',
  },
  picker: {
    height: 55, // Altura estándar para Picker
    width: '100%',
  },
});
