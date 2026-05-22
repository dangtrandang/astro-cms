interface ImportMetaEnv {
  readonly PUBLIC_DIRECTUS_URL: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_ENABLE_VISUAL_EDITING: string;
  readonly DIRECTUS_SERVER_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: { id: string; email?: string; first_name?: string; last_name?: string };
    contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
    token: string;
  }
}
