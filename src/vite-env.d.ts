/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL?: string;
  
  readonly VITE_ADMIN_PASSWORD?: string;
  
  readonly VITE_ADMIN_PASSWORD_B64?: string;
  readonly VITE_EVOLUTION_MANAGER_URL?: string;
}
