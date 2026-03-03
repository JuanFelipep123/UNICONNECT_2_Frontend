/**
 * Componente para item de materia disponible
 * Memoizado para evitar re-renders innecesarios
 */
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SubjectItemProps {
  name: string;
  department: string;
  onAdd: () => void;
  isLoading?: boolean;
}

export const SubjectItem = memo<SubjectItemProps>(({ name, department, onAdd, isLoading = false }) => {
  const handlePress = useCallback(() => {
    if (!isLoading) {
      onAdd();
    }
  }, [onAdd, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.department}>{department}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.addButtonLoading]} 
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
});

SubjectItem.displayName = 'SubjectItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  department: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonLoading: {
    opacity: 0.7,
  },
});
