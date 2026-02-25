import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface ContactInfoSectionProps {
  phone: string;
  onPhoneChange: (value: string) => void;
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

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  phone,
  onPhoneChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.gold }]}>
        Información de Contacto
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.label }]}>
          Número Telefónico
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="phone"
            size={20}
            color={colors.gold}
            style={styles.icon}
          />
          <TextInput
            placeholder="+57 123 456 7890"
            placeholderTextColor={colors.label}
            value={phone}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.text }]}
          />
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
});
