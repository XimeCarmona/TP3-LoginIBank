import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isRecoveryMode: boolean;
  clearRecoveryMode: () => void;
  signOut: () => Promise<void>;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isRecoveryMode: false,
  clearRecoveryMode: () => {},
  signOut: async () => {},
  pendingEmail: '',
  setPendingEmail: () => {},
  successMessage: null,
  setSuccessMessage: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Obtener la sesión inicial persistida en AsyncStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Suscribirse a los cambios de estado de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setIsLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
      }
    });

    // 3. Manejo de Deep Links entrantes (expo-linking)
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      const parsed = Linking.parse(url);
      
      // Si la URL contiene parámetros de reset de contraseña o hash con tokens
      if (
        url.includes('reset-password') ||
        parsed.path === 'reset-password' ||
        parsed.hostname === 'reset-password'
      ) {
        setIsRecoveryMode(true);
      }

      // Si la URL trae access_token y refresh_token en el hash/query
      if (url.includes('access_token=') && url.includes('refresh_token=')) {
        try {
          // Extraer hash fragments si vienen
          const hashIndex = url.indexOf('#');
          const fragment = hashIndex !== -1 ? url.substring(hashIndex + 1) : '';
          const params = new URLSearchParams(fragment || url.split('?')[1] || '');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && type === 'recovery') {
              setIsRecoveryMode(true);
            }
          }
        } catch {
          // Silencioso según regla 7.5
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkSubscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  const clearRecoveryMode = () => {
    setIsRecoveryMode(false);
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setIsRecoveryMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        isRecoveryMode,
        clearRecoveryMode,
        signOut,
        pendingEmail,
        setPendingEmail,
        successMessage,
        setSuccessMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
