# Configuración de Supabase — iBank TP3

Este documento detalla la configuración establecida en el Dashboard de Supabase para dar cumplimiento a los requisitos del Trabajo Práctico (Secciones 05, 06 y 08).

---

## 1. Authentication > URL Configuration

* **Site URL:** `http://localhost:8081` (o `http://localhost:3000`)
  > **IMPORTANTE:** El servidor de Supabase exige obligatoriamente un protocolo `http://` o `https://` en el campo *Site URL*. **Nunca** coloques un esquema personalizado como `ibanktp://` en este campo, ya que el backend de Supabase (GoTrue) arroja un error interno del servidor (`500 Server Error`) al intentar procesar el enlace.
* **Redirect URLs permitidas:**
  * `ibanktp://confirm` (para confirmación de alta de cuenta en app nativa)
  * `ibanktp://reset-password` (para recuperación de contraseña en app nativa)
  * `ibanktp://**` (wildcard para soporte de subrutas y parámetros)
  * `exp://**` (requerido para pruebas en **Expo Go** en el celular o emulador)
  * `http://localhost:8081/**` (para pruebas en la plataforma Web)

---

## 2. Authentication > Password Security

Configurado según las recomendaciones oficiales de seguridad bancaria:

* **Longitud mínima de contraseña:** 8 caracteres.
* **Complejidad exigida:**
  * Al menos una letra mayúscula (`A-Z`).
  * Al menos una letra minúscula (`a-z`).
  * Al menos un dígito numérico (`0-9`).
  * Al menos un símbolo / carácter especial (`!@#$%^&*` etc.).
* **Checklist en UI:** La aplicación valida exactamente estas mismas 5 reglas en tiempo real del lado del cliente antes de permitir el envío del formulario.

---

## 3. Authentication > Email Auth

* **Confirm email:** Activado (`ON`).
  * Toda cuenta registrada ingresa inicialmente en estado pendiente de verificación.
  * El usuario es redirigido a la pantalla de *Confirmación pendiente* hasta validar su casilla.
* **Expiración de enlace / OTP:** 3600 segundos (1 hora).

---

## 4. Rate Limiting

* **Rate Limits por defecto:** 60 segundos por usuario en endpoints de `signup`, `resend` y `recover`.
* **Manejo en la UI:**
  * Ante respuesta HTTP `429 (Too Many Requests)` o error `over_request_rate_limit`, la aplicación bloquea el botón y activa un temporizador regresivo de 60 segundos visible para el usuario.
  * Los botones de reenvío de correo de confirmación y recuperación también aplican un cooldown regresivo de 60 segundos.

---

## 5. Variables de Entorno

En el archivo `.env` de la app sólo se almacenan las credenciales públicas:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

> **Seguridad:** La clave `service_role` **NUNCA** se incluye en la app cliente ni en el repositorio.
