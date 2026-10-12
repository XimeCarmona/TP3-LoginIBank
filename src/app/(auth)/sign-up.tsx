import React, { useState } from 'react';
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
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { IBankHeader } from '@/components/ui/ibank-header';
import { IBankInput } from '@/components/ui/ibank-input';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankCheckbox } from '@/components/ui/ibank-checkbox';
import { IBankBanner } from '@/components/ui/ibank-banner';
import {
  IBankPasswordChecklist,
  evaluatePassword,
} from '@/components/ui/ibank-password-checklist';
import { getTranslatedAuthError } from '@/utils/auth-errors';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

export default function SignUpScreen() {
  const { setPendingEmail } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validaciones en tiempo real
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordRules = evaluatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isNameValid = fullName.trim().length >= 2;

  // Botón habilitado solo si todos los requisitos se cumplen
  const isFormValid =
    isNameValid &&
    isValidEmail &&
    passwordRules.allValid &&
    passwordsMatch &&
    acceptedTerms;

  const handleSignUp = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const emailRedirectTo = Linking.createURL('confirm');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo,
        },
      });

      if (error) {
        // En caso de error de Supabase, lo traducimos
        const translated = getTranslatedAuthError(error);
        setErrorMessage(translated.message);
        return;
      }

      // Anti-enumeración y flujo exitoso:
      // Supabase devuelve el usuario creado o reenvió la confirmación si ya existía.
      // Guardamos el email para la pantalla de confirmación pendiente
      setPendingEmail(email.trim());
      router.push('/(auth)/confirm-email');
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
          title="Crear cuenta"
          subtitle="Registrate para comenzar a gestionar tu dinero."
          iconName="person-add-outline"
          showBack
          onBack={() => router.back()}
        />

        {errorMessage && (
          <IBankBanner type="error" message={errorMessage} />
        )}

        <IBankInput
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!loading}
          leftIconName="person-outline"
        />

        <IBankInput
          label="Correo electrónico"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          leftIconName="mail-outline"
        />

        <IBankInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          editable={!loading}
          leftIconName="lock-closed-outline"
        />

        {/* Checklist de contraseña en tiempo real */}
        <IBankPasswordChecklist password={password} />

        <IBankInput
          label="Confirmar contraseña"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          editable={!loading}
          leftIconName="lock-closed-outline"
          error={
            confirmPassword.length > 0 && !passwordsMatch
              ? 'Las contraseñas no coinciden'
              : undefined
          }
        />

        {/* Checkbox de Términos y Condiciones */}
        <IBankCheckbox
          checked={acceptedTerms}
          onToggle={setAcceptedTerms}
          disabled={loading}
          label={
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsHighlight}>Términos del Servicio</Text> y la{' '}
              <Text style={styles.termsHighlight}>Política de Privacidad</Text> de iBank.
            </Text>
          }
        />

        <IBankButton
          title="Crear cuenta"
          loading={loading}
          loadingText="Creando cuenta..."
          disabled={!isFormValid}
          onPress={handleSignUp}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tenés una cuenta?</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            disabled={loading}
            style={styles.linkButton}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Iniciá sesión</Text>
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
  termsText: {
    fontSize: 13,
    color: IBankColors.textSecondary,
    lineHeight: 18,
  },
  termsHighlight: {
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
