import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { IBankHeader } from '@/components/ui/ibank-header';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankBanner } from '@/components/ui/ibank-banner';
import { getTranslatedAuthError } from '@/utils/auth-errors';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

export default function ConfirmEmailScreen() {
  const { pendingEmail, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60); // Inicia con 60s ya que se acaba de enviar
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>({
    text: 'Te enviamos un enlace de confirmación a tu correo. Por favor, revisá tu bandeja de entrada o spam.',
    type: 'info',
  });

  // Si la sesión se vuelve válida (por deep link entrante), redirigir de inmediato a Home (6.3)
  useEffect(() => {
    if (session) {
      router.replace('/(app)/home');
    }
  }, [session]);

  // Cooldown timer de 60s
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || loading || !pendingEmail) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });

      if (error) {
        const translated = getTranslatedAuthError(error);
        if (translated.isRateLimit) {
          setCooldown(60);
        }
        setMessage({ text: translated.message, type: 'error' });
      } else {
        setCooldown(60);
        setMessage({
          text: 'Se reenvió el correo de confirmación. Por favor, revisá tu casilla.',
          type: 'success',
        });
      }
    } catch (err) {
      const translated = getTranslatedAuthError(err);
      setMessage({ text: translated.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <IBankHeader
        title="Confirmá tu correo"
        subtitle="Verificá tu casilla de correo para activar tu cuenta de iBank."
        iconName="mail-unread-outline"
      />

      {message && <IBankBanner type={message.type} message={message.text} />}

      <View style={styles.card}>
        <Text style={styles.label}>Correo de destino:</Text>
        <Text style={styles.emailValue}>
          {pendingEmail || 'usuario@ejemplo.com'}
        </Text>
        <Text style={styles.hint}>
          Hacé clic en el enlace del correo para verificar tu cuenta y acceder automáticamente.
        </Text>
      </View>

      <IBankButton
        title="Reenviar email"
        loading={loading}
        loadingText="Reenviando..."
        cooldownSeconds={cooldown}
        disabled={cooldown > 0 || !pendingEmail}
        onPress={handleResend}
      />

      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          disabled={loading}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>Volver a Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: IBankColors.background,
    paddingHorizontal: IBankSpacing.xxl,
    paddingVertical: IBankSpacing.huge,
  },
  card: {
    backgroundColor: IBankColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: IBankColors.border,
    borderRadius: IBankRadius.lg,
    padding: IBankSpacing.xl,
    marginBottom: IBankSpacing.xxl,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: IBankColors.textSecondary,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: IBankColors.textPrimary,
    marginBottom: IBankSpacing.md,
  },
  hint: {
    fontSize: 13,
    color: IBankColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
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
