import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

interface IBankInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function IBankInput({
  label,
  error,
  leftIconName,
  isPassword = false,
  containerStyle,
  editable = true,
  value,
  onChangeText,
  placeholder,
  ...rest
}: IBankInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isActuallyDisabled = editable === false;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          isActuallyDisabled && styles.inputDisabled,
        ]}
      >
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={20}
            color={
              error
                ? IBankColors.error
                : isFocused
                ? IBankColors.primary
                : IBankColors.textMuted
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, isActuallyDisabled && styles.inputTextDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={IBankColors.textMuted}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCorrect={false}
          accessibilityLabel={label}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={IBankColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {Boolean(error) && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={IBankColors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: IBankSpacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: IBankColors.textPrimary,
    marginBottom: IBankSpacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IBankColors.inputBackground,
    borderWidth: 1.5,
    borderColor: IBankColors.border,
    borderRadius: IBankRadius.md,
    paddingHorizontal: IBankSpacing.md,
    height: 52,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: IBankColors.borderFocus,
    backgroundColor: IBankColors.inputBackgroundFocus,
  },
  inputError: {
    borderColor: IBankColors.borderError,
    backgroundColor: IBankColors.errorLight,
  },
  inputDisabled: {
    backgroundColor: IBankColors.disabled,
    borderColor: IBankColors.disabled,
  },
  leftIcon: {
    marginRight: IBankSpacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: IBankColors.textPrimary,
    paddingVertical: 0,
    height: '100%',
  },
  inputTextDisabled: {
    color: IBankColors.disabledText,
  },
  eyeButton: {
    padding: IBankSpacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: IBankSpacing.xs,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: IBankColors.error,
    fontWeight: '500',
  },
});
