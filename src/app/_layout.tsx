import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { session, isLoading, isRecoveryMode } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync().catch(() => {});

    const segList = segments as string[];
    const inAuthGroup = segList[0] === '(auth)';
    const inAppGroup = segList[0] === '(app)';
    const isResetPassword = segList.length > 1 && segList[1] === 'reset-password';

    if (isRecoveryMode && !isResetPassword) {
      router.replace('/(auth)/reset-password');
      return;
    }

    if (session && inAuthGroup && !isRecoveryMode) {
      // 7.2 Con sesión válida, las pantallas de autenticación quedan inaccesibles y redirigen a Home
      router.replace('/(app)/home');
    } else if (!session && inAppGroup) {
      // 7.2 Sin sesión, las pantallas privadas redirigen a Login
      router.replace('/(auth)/sign-in');
    }
  }, [session, isLoading, isRecoveryMode, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="wallet" size={38} color={IBankColors.primary} />
        </View>
        <Text style={styles.brandTitle}>iBank</Text>
        <Text style={styles.brandSubtitle}>Banking & E-Money Management</Text>
        <ActivityIndicator size="large" color={IBankColors.primary} style={styles.spinner} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: IBankColors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/confirm-email" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(app)/home" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: IBankColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: IBankSpacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: IBankColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: IBankSpacing.lg,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: IBankColors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: IBankColors.textSecondary,
    marginTop: 4,
  },
  spinner: {
    marginTop: IBankSpacing.xxl,
  },
});
