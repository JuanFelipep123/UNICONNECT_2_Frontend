import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
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
};

export const SaveButton: React.FC<SaveButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  // LOG PARA SABER SI EL COMPONENTE SE RENDERIZA
  console.log("Renderizando SaveButton - Disabled:", disabled, "Loading:", loading);

  return (
    <TouchableOpacity
      // USAMOS UNA FUNCIÓN ANÓNIMA PARA ASEGURARNOS
      onPress={() => {
        console.log("¡CLICK FÍSICO EN EL BOTÓN!");
        onPress();
      }}
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
          <MaterialIcons name="check-circle" size={20} color={colors.gold} />
          <Text style={[styles.text, { color: colors.gold, marginLeft: 8 }]}>
            Guardar Perfil
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row', // Importante para alinear icono y texto
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Forzar que ocupe todo el ancho del padre
    minHeight: 50,  // Asegurar área táctil mínima
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