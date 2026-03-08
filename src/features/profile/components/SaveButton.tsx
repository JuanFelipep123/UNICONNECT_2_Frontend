import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

interface SaveButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const colors = {
  primary: '#00284D',
  gold: '#C5A059',
  white: '#FFFFFF',
};

// Memoizar para evitar re-renders innecesarios
export const SaveButton = memo<SaveButtonProps>(
  ({ onPress, loading = false, disabled = false }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.gold} size="small" />
        ) : (
          <>
            <MaterialIcons name="check-circle" size={20} color={colors.white} />
            <Text style={[styles.text, { color: colors.white, marginLeft: 8 }]}>
              Guardar Perfil
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

SaveButton.displayName = 'SaveButton';