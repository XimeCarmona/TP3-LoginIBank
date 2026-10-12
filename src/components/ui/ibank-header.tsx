import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

interface IBankHeaderProps {
  title: string;
  subtitle: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  showBack?: boolean;
}

export function IBankHeader({
  title,
  subtitle,
  iconName = 'shield-checkmark',
  onBack,
  showBack = false,
}: IBankHeaderProps) {
  return (
    <View style={styles.container}>
      {showBack && onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={IBankColors.textPrimary} />
        </TouchableOpacity>
      )}

      <View style={styles.badgeContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={30} color={IBankColors.primary} />
        </View>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: IBankSpacing.xxl,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: IBankSpacing.lg,
    marginTop: IBankSpacing.sm,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: IBankColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
  dot1: {
    width: 8,
    height: 8,
    backgroundColor: '#93C5FD',
    top: -2,
    right: 4,
  },
  dot2: {
    width: 10,
    height: 10,
    backgroundColor: '#FBCFE8',
    bottom: 2,
    left: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: IBankColors.textPrimary,
    textAlign: 'center',
    marginBottom: IBankSpacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: IBankColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: IBankSpacing.lg,
  },
});
