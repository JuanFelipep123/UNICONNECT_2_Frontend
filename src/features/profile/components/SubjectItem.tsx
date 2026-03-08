/**
 * Componente para item de materia disponible
 * Memoizado para evitar re-renders innecesarios
 */
import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubjectItemProps {
  name: string;
  department: string;
  onAdd: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'onboarding';
}

export const SubjectItem = memo<SubjectItemProps>(({ name, department, onAdd, isLoading = false, variant = 'default' }) => {
  const handlePress = useCallback(() => {
    if (!isLoading) {
      onAdd();
    }
  }, [onAdd, isLoading]);

  const isOnboarding = variant === 'onboarding';

  return (
    <View style={[styles.container, isOnboarding && styles.containerOnboarding]}>
      <View style={styles.content}>
        <Text style={[styles.name, isOnboarding && styles.nameOnboarding]}>{name}</Text>
        {!isOnboarding ? <Text style={styles.department}>{department}</Text> : null}
      </View>
      <TouchableOpacity 
        style={[styles.addButton, isOnboarding && styles.addButtonOnboarding, isLoading && styles.addButtonLoading]} 
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isOnboarding ? '#C5A059' : '#FFFFFF'} />
        ) : (
          <MaterialIcons name="add" size={20} color={isOnboarding ? '#C5A059' : '#FFFFFF'} />
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
  containerOnboarding: {
    backgroundColor: '#F4F6F9',
    borderColor: '#E5EAF1',
    borderRadius: 14,
    marginBottom: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
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
  nameOnboarding: {
    fontSize: 18,
    lineHeight: 24,
    color: '#222F44',
    fontWeight: '600',
    marginBottom: 0,
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
  addButtonOnboarding: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  addButtonLoading: {
    opacity: 0.7,
  },
});
