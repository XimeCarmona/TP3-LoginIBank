import { AuthError } from '@supabase/supabase-js';

export interface TranslatedAuthError {
  code: string;
  message: string;
  isRateLimit: boolean;
  isEmailNotConfirmed: boolean;
  isInvalidCredentials: boolean;
  isNetworkError: boolean;
}

/**
 * Traduce y centraliza el manejo de errores de Supabase Auth
 * Cumple con las reglas transversales 7.4 y reglas anti-enumeración de la sección 6.
 */
export function getTranslatedAuthError(error: unknown): TranslatedAuthError {
  if (!error) {
    return {
      code: 'unknown',
      message: 'Ocurrió un error inesperado. Por favor, reintentá.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  const err = error as AuthError | Error;
  const rawMessage = (err.message || '').toLowerCase();
  const rawCode = ('code' in err ? String(err.code || '') : '').toLowerCase();
  const status = 'status' in err ? (err as any).status : undefined;

  // 1. Detección de Email no confirmado
  if (
    rawCode === 'email_not_confirmed' ||
    rawMessage.includes('email not confirmed') ||
    rawMessage.includes('email_not_confirmed')
  ) {
    return {
      code: 'email_not_confirmed',
      message: 'Tu correo electrónico aún no ha sido confirmado. Te redirigiremos para que puedas activarlo.',
      isRateLimit: false,
      isEmailNotConfirmed: true,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  // 2. Detección de Rate Limiting (429 / over_request_rate_limit)
  if (
    status === 429 ||
    rawCode === 'over_request_rate_limit' ||
    rawCode === 'rate_limit_exceeded' ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests')
  ) {
    return {
      code: 'over_request_rate_limit',
      message: 'Demasiados intentos seguidos. Por favor, aguardá unos instantes antes de volver a intentar.',
      isRateLimit: true,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  // 3. Credenciales inválidas (anti-enumeración estricta)
  if (
    rawCode === 'invalid_credentials' ||
    rawMessage.includes('invalid login credentials') ||
    rawMessage.includes('invalid credentials')
  ) {
    return {
      code: 'invalid_credentials',
      message: 'Email o contraseña incorrectos.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: true,
      isNetworkError: false,
    };
  }

  // 4. Contraseña débil
  if (
    rawCode === 'weak_password' ||
    rawMessage.includes('weak password') ||
    rawMessage.includes('password should be')
  ) {
    return {
      code: 'weak_password',
      message: 'La contraseña no cumple con los requisitos mínimos de seguridad.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  // 5. Usuario ya registrado (para casos donde Supabase lo retorne; aunque en signup manejamos mensaje neutro)
  if (
    rawCode === 'user_already_exists' ||
    rawMessage.includes('user already registered')
  ) {
    return {
      code: 'user_already_exists',
      message: 'Si el correo electrónico ingresado es válido, recibirás instrucciones para continuar.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  // 6. Errores de red o conexión
  if (
    rawMessage.includes('network') ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('failed to fetch')
  ) {
    return {
      code: 'network_error',
      message: 'Problema de conexión con el servidor. Verificá tu conexión a internet.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: true,
    };
  }

  // 7. Enlace expirado o token inválido
  if (
    rawCode === 'otp_expired' ||
    rawMessage.includes('expired') ||
    rawMessage.includes('invalid token') ||
    rawMessage.includes('token has expired')
  ) {
    return {
      code: 'link_expired',
      message: 'El enlace de recuperación ha vencido o es inválido.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
      isNetworkError: false,
    };
  }

  // Fallback genérico sin exponer detalles internos
  return {
    code: rawCode || 'auth_error',
    message: err.message || 'No se pudo completar la solicitud. Por favor, reintentá.',
    isRateLimit: false,
    isEmailNotConfirmed: false,
    isInvalidCredentials: false,
    isNetworkError: false,
  };
}
