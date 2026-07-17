/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du serveur de salons (Cloudflare Worker) injectée au build — voir docs/DEPLOYMENT.md. */
  readonly VITE_SYNC_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
