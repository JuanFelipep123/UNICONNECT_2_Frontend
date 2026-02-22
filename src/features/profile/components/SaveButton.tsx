import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface SaveButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const colors = {
  light: {
    primary: '#00284D',
    gold: '#C5A059',
  },
  dark: {
    primary: '#00284D',
    gold: '#C5A059',
  },
};

export const SaveButton: React.FC<SaveButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: theme.primary,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.gold} size="small" />
        ) : (
          <MaterialIcons name="check-circle" size={20} color={theme.gold} />
        )}
        <Text style={[styles.text, { color: theme.gold }]}>
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
