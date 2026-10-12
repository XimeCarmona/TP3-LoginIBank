import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { IBankHeader } from '@/components/ui/ibank-header';
import { IBankInput } from '@/components/ui/ibank-input';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankBanner } from '@/components/ui/ibank-banner';
import { getTranslatedAuthError } from '@/utils/auth-errors';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

export default function SignInScreen() {
  const { setPendingEmail, successMessage, setSuccessMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer de 60s tras rate limit (429)
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Validación de cliente: email con formato válido y contraseña no vacía
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isValidEmail && password.length > 0;

  const handleSignIn = async () => {
    if (!isFormValid || loading || cooldown > 0) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const translated = getTranslatedAuthError(error);

        // Si el email no está confirmado, redirigir a Confirmación pendiente (6.3)
        if (translated.isEmailNotConfirmed) {
          setPendingEmail(email.trim());
          router.push('/(auth)/confirm-email');
          return;
        }

        // Si hay rate limit (429), activar cooldown de 60 segundos
        if (translated.isRateLimit) {
          setCooldown(60);
        }

        setErrorMessage(translated.message);
        return;
      }

      // Login exitoso: el observador de sesión redirigirá automáticamente a Home
      if (data.session) {
        router.replace('/(app)/home');
      }
    } catch (err) {
      const translated = getTranslatedAuthError(err);
      setErrorMessage(translated.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <IBankHeader
          title="Iniciar sesión"
          subtitle="Accedé a tu cuenta de iBank de forma segura."
          iconName="lock-closed"
        />

        {successMessage && (
          <IBankBanner type="success" message={successMessage} />
        )}

        {errorMessage && (
          <IBankBanner type="error" message={errorMessage} />
        )}

        <IBankInput
          label="Correo electrónico"
          placeholder="tu@email.com"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (errorMessage) setErrorMessage(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          leftIconName="mail-outline"
        />

        <IBankInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          isPassword
          editable={!loading}
          leftIconName="key-outline"
        />

        <View style={styles.forgotRow}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            disabled={loading}
            style={styles.forgotButton}
            accessibilityRole="button"
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <IBankButton
          title="Iniciar sesión"
          loading={loading}
          loadingText="Iniciando sesión..."
          disabled={!isFormValid}
          cooldownSeconds={cooldown}
          onPress={handleSignIn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tenés una cuenta?</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            disabled={loading}
            style={styles.linkButton}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Registrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: IBankColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: IBankSpacing.xxl,
    paddingVertical: IBankSpacing.huge,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: IBankSpacing.xl,
  },
  forgotButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotText: {
    fontSize: 14,
    color: IBankColors.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: IBankSpacing.xxl,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: IBankColors.textSecondary,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    color: IBankColors.primary,
    fontWeight: '700',
  },
});
