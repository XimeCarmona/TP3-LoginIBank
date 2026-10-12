# iBank Mobile — Flujo de Autenticación con Supabase

Trabajo Práctico N° 3 — Arquitectura y Programación Móvil (2026)  
Implementación del flujo de autenticación completo (inicio de sesión, registro, confirmación de correo y restablecimiento de contraseña) basado en el kit de diseño de **iBank — Banking & E-Money Management App** de Figma y conectado a **Supabase Auth** como Backend-as-a-Service (BaaS).

---

## 📱 Pantallas Implementadas

1. **01 · Iniciar sesión (`/(auth)/sign-in`)**
   * Validación de formato de email y contraseña no vacía para habilitar el botón.
   * Estados de loading (spinner + botón disabled + inputs bloqueados).
   * Protección anti-enumeración ante credenciales inválidas.
   * Detección de email no confirmado con redirección automática a la pantalla de confirmación.
   * Manejo de Rate Limit (HTTP 429) con cooldown visual de 60 segundos con contador regresivo.

2. **02 · Registro (`/(auth)/sign-up`)**
   * Checklist interactivo en tiempo real para la contraseña:
     - Mínimo 8 caracteres
     - Al menos una mayúscula
     - Al menos una minúscula
     - Al menos un dígito
     - Al menos un símbolo especial
   * Confirmación exacta de contraseña.
   * Checkbox obligatorio de Términos del Servicio y Política de Privacidad.
   * Persistencia del nombre completo en `user_metadata` y deep link de confirmación (`options.emailRedirectTo`).
   * Respuesta neutra de éxito si el email ya existe para prevenir enumeración.

3. **03 · Confirmación pendiente (`/(auth)/confirm-email`)**
   * Muestra el email al que se envió el enlace de activación.
   * Botón de reenvío (`resend`) con cooldown regresivo de 60 segundos.
   * Detección reactiva de la confirmación mediante deep link o sesión activa para redirigir a Home sin pasos intermedios.

4. **04 · Recuperar contraseña (`/(auth)/forgot-password`)**
   * Solicitud de reset vía `resetPasswordForEmail`.
   * Mensaje de confirmación neutro anti-enumeración: *"Si el email existe en nuestro sistema, vas a recibir instrucciones"*.
   * Cooldown de 60 segundos para evitar reenvíos abusivos.

5. **05 · Nueva contraseña (`/(auth)/reset-password`)**
   * Se accede exclusivamente a través del deep link del correo o con evento `PASSWORD_RECOVERY`.
   * Pantalla de error dedicada si el enlace caducó o es inválido con acceso a solicitar uno nuevo.
   * Mismas validaciones de complejidad de contraseña en tiempo real.
   * Cierre de sesión temporal (`signOut`) tras el cambio exitoso y redirección a Login con aviso de éxito.

6. **06 · Home / Ruta Protegida (`/(app)/home`)**
   * Pantalla protegida que muestra la tarjeta Platinum de iBank, datos del usuario autenticado (nombre, email y UID) y botón de cierre de sesión (`signOut`).
   * Redirección controlada sin parpadeos mediante observador de sesión en `RootLayout`.

---

## 🛠️ Stack Tecnológico

* **Framework:** React Native + Expo (SDK 57)
* **Navegación:** Expo Router (File-based routing)
* **Backend BaaS:** `@supabase/supabase-js` (v2)
* **Persistencia de Sesión:** `@react-native-async-storage/async-storage`
* **Polyfills:** `react-native-url-polyfill`
* **Deep Linking:** `expo-linking` (esquema `ibanktp`)
* **Validaciones:** `zod` + `react-hook-form`
* **Iconografía y UI:** `@expo/vector-icons` (Ionicons) + tokens de diseño de iBank

---

## ⚙️ Configuración y Variables de Entorno

1. Crear un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

2. En el panel de Supabase (**Authentication > URL Configuration**), registrar las URLs de redirección:
   * `ibanktp://confirm`
   * `ibanktp://reset-password`
   * `ibanktp://*`

3. Activar **Confirm email** y configurar la política de contraseñas (mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo) según se detalla en [`SUPABASE_CONFIG.md`](./SUPABASE_CONFIG.md).

---

## 🚀 Cómo Ejecutar el Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```

3. **Ejecutar en plataforma:**
   * **Android Emulator / Dispositivo:** Presionar `a` en la terminal o correr `npx expo start --android`.
   * **Web:** Presionar `w` o correr `npx expo start --web`.
   * **Expo Go / Development Build:** Escanear el código QR con la app de Expo Go en tu teléfono.

4. **Verificación de tipos y linting:**
   ```bash
   npx tsc --noEmit
   npm run lint
   ```

---

## 📄 Documentos Complementarios

* [`SUPABASE_CONFIG.md`](./SUPABASE_CONFIG.md): Registro detallado de la configuración aplicada en Supabase.
* [`DECISIONES.md`](./DECISIONES.md): Documento de decisiones de diseño, adaptaciones respecto al Figma y justificaciones técnicas.
