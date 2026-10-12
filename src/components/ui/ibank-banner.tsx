import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

interface IBankBannerProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onDismiss?: () => void;
}

export function IBankBanner({ type, message }: IBankBannerProps) {
  if (!message) return null;

  const config = {
    error: {
      bg: IBankColors.errorLight,
      border: IBankColors.errorBorder,
      text: IBankColors.error,
      icon: 'alert-circle' as const,
    },
    success: {
      bg: IBankColors.successLight,
      border: IBankColors.successBorder,
      text: IBankColors.success,
      icon: 'checkmark-circle' as const,
    },
    info: {
      bg: IBankColors.primaryLight,
      border: '#C7D2FE',
      text: IBankColors.primary,
      icon: 'information-circle' as const,
    },
  }[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={20} color={config.text} style={styles.icon} />
      <Text style={[styles.text, { color: config.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: IBankSpacing.md,
    borderRadius: IBankRadius.md,
    borderWidth: 1,
    marginBottom: IBankSpacing.lg,
  },
  icon: {
    marginRight: IBankSpacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
