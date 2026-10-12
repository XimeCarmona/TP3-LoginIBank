import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { IBankButton } from '@/components/ui/ibank-button';
import { IBankColors, IBankRadius, IBankSpacing } from '@/constants/ibank-theme';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const fullName = user?.user_metadata?.full_name || 'Usuario iBank';
  const email = user?.email || 'usuario@ibank.com';

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header superior */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{fullName}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            accessibilityLabel="Perfil de usuario"
            accessibilityRole="button"
          >
            <Ionicons name="person" size={20} color={IBankColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tarjeta Bancaria iBank (estilo Figma) */}
        <View style={styles.bankCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBankName}>iBank Platinum</Text>
            <Ionicons name="wifi" size={20} color="#FFFFFF" />
          </View>

          <Text style={styles.cardNumber}>••••  ••••  ••••  8429</Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>TITULAR</Text>
              <Text style={styles.cardValue}>{fullName}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRA</Text>
              <Text style={styles.cardValue}>12/28</Text>
            </View>
          </View>
        </View>

        {/* Información de Sesión y Supabase */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detalles de la Cuenta</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="mail-outline" size={20} color={IBankColors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo registrado</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={IBankColors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estado de autenticación</Text>
              <Text style={[styles.infoValue, { color: IBankColors.success }]}>
                Sesión verificada (Supabase Auth)
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="key-outline" size={20} color={IBankColors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID de Usuario (UID)</Text>
              <Text style={styles.infoUid} numberOfLines={1} ellipsizeMode="middle">
                {user?.id || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Logout (7.3) */}
        <View style={styles.actions}>
          <IBankButton
            title="Cerrar sesión"
            variant="outline"
            loading={loggingOut}
            loadingText="Cerrando sesión..."
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IBankColors.backgroundSecondary,
  },
  container: {
    padding: IBankSpacing.xl,
    paddingBottom: IBankSpacing.huge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IBankSpacing.xxl,
    marginTop: IBankSpacing.sm,
  },
  greeting: {
    fontSize: 14,
    color: IBankColors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: IBankColors.textPrimary,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: IBankColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankCard: {
    backgroundColor: IBankColors.primary,
    borderRadius: IBankRadius.xl,
    padding: IBankSpacing.xl,
    marginBottom: IBankSpacing.xxl,
    shadowColor: IBankColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IBankSpacing.xxl,
  },
  cardBankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: IBankSpacing.xxl,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: IBankRadius.lg,
    padding: IBankSpacing.lg,
    borderWidth: 1,
    borderColor: IBankColors.border,
    marginBottom: IBankSpacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: IBankColors.textPrimary,
    marginBottom: IBankSpacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: IBankSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: IBankColors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: IBankSpacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: IBankColors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: IBankColors.textPrimary,
  },
  infoUid: {
    fontSize: 13,
    color: IBankColors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    marginTop: IBankSpacing.sm,
  },
});
