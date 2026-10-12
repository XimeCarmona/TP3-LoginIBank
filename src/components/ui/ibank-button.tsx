import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

interface IBankButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  cooldownSeconds?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function IBankButton({
  title,
  onPress,
  loading = false,
  loadingText,
  disabled = false,
  cooldownSeconds = 0,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}: IBankButtonProps) {
  const isCooldownActive = cooldownSeconds > 0;
  const isActuallyDisabled = disabled || loading || isCooldownActive;

  let displayTitle = title;
  if (loading && loadingText) {
    displayTitle = loadingText;
  } else if (isCooldownActive) {
    displayTitle = `Reintentar en ${cooldownSeconds}s`;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isActuallyDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isActuallyDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || title}
      style={[
        styles.base,
        styles[variant],
        isActuallyDisabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : IBankColors.primary}
            style={styles.spinner}
          />
          <Text
            style={[
              styles.textBase,
              styles[`${variant}Text` as keyof typeof styles],
              isActuallyDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {displayTitle}
          </Text>
        </>
      ) : (
        <Text
          style={[
            styles.textBase,
            styles[`${variant}Text` as keyof typeof styles],
            isActuallyDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {displayTitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: IBankRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: IBankSpacing.xl,
    minHeight: 48,
  },
  spinner: {
    marginRight: IBankSpacing.sm,
  },
  primary: {
    backgroundColor: IBankColors.primary,
  },
  secondary: {
    backgroundColor: IBankColors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: IBankColors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: IBankColors.disabled,
    borderColor: IBankColors.disabled,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: IBankColors.primary,
  },
  outlineText: {
    color: IBankColors.primary,
  },
  ghostText: {
    color: IBankColors.primary,
  },
  disabledText: {
    color: IBankColors.disabledText,
  },
});
