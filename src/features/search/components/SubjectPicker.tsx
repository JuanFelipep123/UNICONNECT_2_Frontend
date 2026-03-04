/**
 * Selector de materia con tres estados: loading, error, lista.
 * Sigue el mismo patrón visual de AcademicInfoSection.tsx.
 */
import { Picker } from "@react-native-picker/picker";
import React, { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LIGHT_THEME } from "../../../theme/themeContext";
import type { SearchSubject } from "../types/search";

const colors = LIGHT_THEME;

interface SubjectPickerProps {
  subjects: SearchSubject[];
  selectedSubject: SearchSubject | null;
  loading: boolean;
  error: string | null;
  onSelect: (subject: SearchSubject) => void;
  /** Llamado cuando el usuario vuelve a la opción vacía del picker */
  onClear?: () => void;
}

export const SubjectPicker = memo<SubjectPickerProps>(
  ({ subjects, selectedSubject, loading, error, onSelect, onClear }) => {
    if (loading) {
      return (
        <View style={styles.feedbackRow}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.feedbackText}>Cargando materias...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.feedbackRow, styles.errorBox]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.label}>MATERIA</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject?.id ?? ""}
            onValueChange={(itemValue) => {
              if (!itemValue) {
                onClear?.();
                return;
              }
              const found = subjects.find((s) => s.id === itemValue);
              if (found) onSelect(found);
            }}
            style={styles.picker}
            dropdownIconColor={colors.gold}
          >
            <Picker.Item
              label="Selecciona una materia..."
              value=""
              color={colors.label}
            />
            {subjects.map((subject) => (
              <Picker.Item
                key={subject.id}
                label={subject.name}
                value={subject.id}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  },
);

SubjectPicker.displayName = "SubjectPicker";

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.label,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    height: 56,
    justifyContent: "center",
  },
  picker: {
    color: colors.text,
    height: 56,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.label,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flexShrink: 1,
  },
});
