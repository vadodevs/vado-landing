/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL?: string;
  /** Contraseña en texto (evitar caracteres que dotenv-expand interprete mal, p. ej. `$`). */
  readonly VITE_ADMIN_PASSWORD?: string;
  /** Contraseña en Base64 (recomendado si incluye `$` u otros símbolos). */
  readonly VITE_ADMIN_PASSWORD_B64?: string;
}
