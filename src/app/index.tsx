import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function Index() {
  const { session, isLoading, isRecoveryMode } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isRecoveryMode) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (session) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
