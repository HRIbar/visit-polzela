/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to 'https://visit-polzela.com' in the mobile Capacitor build (vite.mobile.config.ts).
   *  Empty string for the web build — relative /api/… paths are used. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

