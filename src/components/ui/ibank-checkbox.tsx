import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

interface IBankCheckboxProps {
  checked: boolean;
  onToggle: (newVal: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}

export function IBankCheckbox({
  checked,
  onToggle,
  label,
  disabled = false,
}: IBankCheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onToggle(!checked)}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </View>
      {Boolean(label) && <View style={styles.labelContainer}>{label}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: IBankSpacing.md,
    minHeight: 44, // Touch target >= 44
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: IBankColors.textMuted,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: IBankSpacing.sm,
  },
  boxChecked: {
    backgroundColor: IBankColors.primary,
    borderColor: IBankColors.primary,
  },
  boxDisabled: {
    backgroundColor: IBankColors.disabled,
    borderColor: IBankColors.disabled,
  },
  labelContainer: {
    flex: 1,
  },
});
