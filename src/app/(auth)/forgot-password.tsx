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
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { IBankHeader } from '@/components/ui/ibank-header';
import { IBankInput } from '@/components/ui/ibank-input';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankBanner } from '@/components/ui/ibank-banner';
import { getTranslatedAuthError } from '@/utils/auth-errors';
import { IBankColors, IBankSpacing } from '@/constants/ibank-theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cooldown timer de 60s
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Único campo: email. Validar solo formato.
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleResetPassword = async () => {
    if (!isValidEmail || loading || cooldown > 0) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      // Deep link apuntando a la pantalla de reseteo
      const redirectTo = Linking.createURL('reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        const translated = getTranslatedAuthError(error);
        if (translated.isRateLimit) {
          setCooldown(60);
        }
        setErrorMessage(translated.message);
        return;
      }

      // Regla de negocio no negociable (6.4): mensaje neutro anti-enumeración
      setCooldown(60);
      setSuccessInfo(
        'Si el email existe en nuestro sistema, vas a recibir instrucciones para restablecer tu contraseña.'
      );
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
          title="Recuperar contraseña"
          subtitle="Ingresá tu correo para recibir las instrucciones de recuperación."
          iconName="key-outline"
          showBack
          onBack={() => router.back()}
        />

        {successInfo && <IBankBanner type="info" message={successInfo} />}

        {errorMessage && <IBankBanner type="error" message={errorMessage} />}

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

        <IBankButton
          title="Enviar instrucciones"
          loading={loading}
          loadingText="Enviando..."
          disabled={!isValidEmail || cooldown > 0}
          cooldownSeconds={cooldown}
          onPress={handleResetPassword}
        />

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            disabled={loading}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Volver a Iniciar sesión</Text>
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
  footerRow: {
    alignItems: 'center',
    marginTop: IBankSpacing.xxl,
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: IBankColors.primary,
    fontWeight: '600',
  },
});
