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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { IBankHeader } from '@/components/ui/ibank-header';
import { IBankInput } from '@/components/ui/ibank-input';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankBanner } from '@/components/ui/ibank-banner';
import {
  IBankPasswordChecklist,
  evaluatePassword,
} from '@/components/ui/ibank-password-checklist';
import { getTranslatedAuthError } from '@/utils/auth-errors';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

export default function ResetPasswordScreen() {
  const { isRecoveryMode, clearRecoveryMode, setSuccessMessage } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordRules = evaluatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = passwordRules.allValid && passwordsMatch;

  // Si el link llegó vencido o inválido, o se accede sin recuperación válida (6.5)
  if (!isRecoveryMode) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <IBankHeader
          title="Enlace inválido o expirado"
          subtitle="El enlace para restablecer la contraseña ha caducado o no es válido."
          iconName="alert-circle-outline"
        />

        <IBankBanner
          type="error"
          message="Por razones de seguridad, los enlaces de recuperación solo pueden usarse una vez y vencen tras un período determinado."
        />

        <View style={styles.expiredCard}>
          <Text style={styles.expiredText}>
            Para restablecer tu contraseña, solicitá un nuevo enlace desde la pantalla de recuperación.
          </Text>

          <IBankButton
            title="Solicitar nuevo enlace"
            onPress={() => router.replace('/(auth)/forgot-password')}
          />
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/sign-in')}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Volver a Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const handleUpdatePassword = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Actualizar contraseña del usuario en Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const translated = getTranslatedAuthError(error);
        setErrorMessage(translated.message);
        return;
      }

      // 2. Regla 6.5: cerrar la sesión temporal de recuperación (signOut)
      // y llevar al usuario a Login con mensaje de éxito, en lugar de dejarlo logueado
      clearRecoveryMode();
      await supabase.auth.signOut();

      setSuccessMessage('Tu contraseña se actualizó correctamente. Iniciá sesión con tus nuevas credenciales.');
      router.replace('/(auth)/sign-in');
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
          title="Nueva contraseña"
          subtitle="Definí una nueva contraseña segura para tu cuenta."
          iconName="shield-checkmark-outline"
        />

        {errorMessage && (
          <IBankBanner type="error" message={errorMessage} />
        )}

        <IBankInput
          label="Nueva contraseña"
          placeholder="••••••••"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          editable={!loading}
          leftIconName="lock-closed-outline"
        />

        {/* Checklist en tiempo real idéntico al de Registro */}
        <IBankPasswordChecklist password={newPassword} />

        <IBankInput
          label="Confirmar nueva contraseña"
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

        <IBankButton
          title="Actualizar contraseña"
          loading={loading}
          loadingText="Actualizando..."
          disabled={!isFormValid}
          onPress={handleUpdatePassword}
        />

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={async () => {
              clearRecoveryMode();
              await supabase.auth.signOut();
              router.replace('/(auth)/sign-in');
            }}
            disabled={loading}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Cancelar y volver al inicio</Text>
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
  expiredCard: {
    backgroundColor: IBankColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: IBankColors.border,
    borderRadius: IBankRadius.lg,
    padding: IBankSpacing.xl,
    marginBottom: IBankSpacing.xxl,
  },
  expiredText: {
    fontSize: 14,
    color: IBankColors.textSecondary,
    lineHeight: 20,
    marginBottom: IBankSpacing.lg,
    textAlign: 'center',
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
