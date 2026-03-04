/**
 * Componente chip para mostrar materia con botón de remover
 * Memoizado para evitar re-renders innecesarios
 */
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SubjectChipProps {
  id: string;
  name: string;
  onRemove: (id: string) => void;
  isLoading?: boolean;
}

export const SubjectChip = memo<SubjectChipProps>(({ id, name, onRemove, isLoading = false }) => {
  const handleRemove = useCallback(() => {
    if (!isLoading) {
      onRemove(id);
    }
  }, [onRemove, id, isLoading]);

  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{name}</Text>
      <TouchableOpacity 
        onPress={handleRemove} 
        style={[styles.removeButton, isLoading && styles.removeButtonLoading]}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#00284D" />
        ) : (
          <MaterialIcons name="close" size={18} color="#00284D" />
        )}
      </TouchableOpacity>
    </View>
  );
});

SubjectChip.displayName = 'SubjectChip';

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00284D',
    borderRadius: 999,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00284D',
  },
  removeButton: {
    padding: 2,
  },
  removeButtonLoading: {
    opacity: 0.6,
  },
});
