# Documento de Decisiones de Diseño e Implementación — iBank TP3

Este documento resume las decisiones técnicas y de diseño adoptadas en la implementación del flujo de autenticación de **iBank**, comparando el diseño de Figma con la arquitectura final de la aplicación.

---

## 1. Qué se mapeó del Figma tal cual

1. **Paleta de Colores y Estilo Visual:**
   * **Color Primario (Brand Indigo/Blue):** `#1D3BB9` para botones principales, estados activos y acentos de navegación.
   * **Fondos y Superficies:** Fondo principal blanco puro (`#FFFFFF`) y fondos secundarios suaves (`#F8FAFC`) para campos de formulario y tarjetas.
   * **Bordes y Estados:** Bordes grises sutiles (`#E2E8F0`), foco en color primario e indicador de error en rojo (`#EF4444`).
   * **Distintivo iBank:** Se replicó el isotipo circular superior con fondo lavanda/azul tenue (`#EEF2FF`), icono temático y pequeños puntos decorativos característicos del kit de diseño.

2. **Tipografía y Jerarquía:**
   * Jerarquía limpia con títulos en peso bold (`700`), subtítulos descriptivos legibles y etiquetas explícitas sobre los inputs.

3. **Componentes y Estados:**
   * **Botones:** Altura de 52px con esquinas redondeadas (`borderRadius: 12`), estados normal, presionado, deshabilitado y estado de carga con spinner y texto interactivo.
   * **Campos de Entrada:** Inputs redondeados con soporte para iconos a la izquierda y botón de alternancia de visibilidad de contraseña (ojo abrir/cerrar) a la derecha.
   * **Tarjeta Bancaria iBank (Home):** Reproducción de la tarjeta física Platinum de iBank con gradiente/azul primario, microchip/contactless, número enmascarado y titular.

---

## 2. Qué se adaptó y por qué

1. **Checklist Visual de Contraseña en Tiempo Real (Sección 6.2):**
   * *Figma:* El diseño estático suele mostrar un único campo de texto o un tooltip genérico.
   * *Adaptación:* Se construyó un componente reactivo (`IBankPasswordChecklist`) que evalúa en tiempo real 5 reglas esenciales (longitud >= 8, mayúscula, minúscula, dígito y símbolo especial) marcando con tildes verdes conforme el usuario tipea. Esto mejora drásticamente la usabilidad y previene errores al enviar el formulario.

2. **Manejo Estricto Anti-Enumeración (Secciones 6.1, 6.2 y 6.4):**
   * *Adaptación:* Tanto en login inválido ("Email o contraseña incorrectos") como en registro existente y recuperación de contraseña, la interfaz muestra mensajes neutros universales. Esto evita que actores maliciosos deduzcan si un correo electrónico se encuentra registrado o no en la plataforma bancaria.

3. **Cooldown Visual de 60 Segundos en Rate Limiting:**
   * *Adaptación:* Ante respuestas `429 Too Many Requests` o reenvíos de enlaces, el botón pasa a estado deshabilitado con cuenta regresiva en segundos (`Reintentar en Xs`), sincronizado con la política de Supabase.

4. **Persistencia y Refresh Token:**
   * Se optó por `@react-native-async-storage/async-storage` junto a `react-native-url-polyfill`, siguiendo la guía oficial de Supabase para React Native y Expo, complementado con el ciclo de vida de `AppState` para pausar y reactivar el auto-refresh cuando la app pasa a segundo o primer plano.

5. **Navegación Protegida sin Parpadeos:**
   * Implementada con **Expo Router** mediante un observador en el `RootLayout`, mostrando un splash branded mientras se resuelve la sesión inicial persistida.

---

## 3. Qué quedó fuera de alcance (y justificación)

Según lo estipulado en la Sección 01 y 09 de las consignas:

1. **Login Social (OAuth con Google, Apple, etc.):**
   * Excluido del alcance obligatorio para priorizar el flujo bancario formal por credenciales seguras.
2. **Segundo Factor de Autenticación (MFA / OTP por SMS):**
   * Mantenido fuera de la entrega obligatoria; se implementó el flujo estándar de confirmación y recuperación por enlace de correo electrónico seguro.
3. **Autenticación Biométrica / PIN Local:**
   * Corresponde a etapas posteriores de seguridad del dispositivo; este trabajo se enfoca al 100% en la UI bancaria y su integración directa con Supabase Auth.
4. **Sincronización a tabla `profiles` mediante triggers:**
   * Los datos adicionales como el nombre completo se almacenan directamente en `user_metadata` dentro de Supabase Auth sin requerir tablas relacionales adicionales en el backend.
