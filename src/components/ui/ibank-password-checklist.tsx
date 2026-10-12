import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

export interface PasswordRulesState {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  allValid: boolean;
}

export function evaluatePassword(password: string): PasswordRulesState {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    allValid: minLength && hasUpper && hasLower && hasNumber && hasSymbol,
  };
}

interface IBankPasswordChecklistProps {
  password: string;
}

export function IBankPasswordChecklist({ password }: IBankPasswordChecklistProps) {
  const rules = evaluatePassword(password);

  const items = [
    { label: 'Mínimo 8 caracteres', satisfied: rules.minLength },
    { label: 'Al menos una mayúscula (A-Z)', satisfied: rules.hasUpper },
    { label: 'Al menos una minúscula (a-z)', satisfied: rules.hasLower },
    { label: 'Al menos un dígito (0-9)', satisfied: rules.hasNumber },
    { label: 'Al menos un símbolo especial (!@#$...)', satisfied: rules.hasSymbol },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requisitos de contraseña:</Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Ionicons
              name={item.satisfied ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.satisfied ? IBankColors.success : IBankColors.textMuted}
            />
            <Text
              style={[
                styles.itemText,
                item.satisfied ? styles.textSatisfied : styles.textUnsatisfied,
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: IBankColors.backgroundSecondary,
    padding: IBankSpacing.md,
    borderRadius: 12,
    marginBottom: IBankSpacing.lg,
    borderWidth: 1,
    borderColor: IBankColors.border,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: IBankColors.textSecondary,
    marginBottom: IBankSpacing.xs,
  },
  list: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 12,
  },
  textSatisfied: {
    color: IBankColors.success,
    fontWeight: '600',
  },
  textUnsatisfied: {
    color: IBankColors.textMuted,
    fontWeight: '400',
  },
});
