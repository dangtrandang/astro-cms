interface ImportMetaEnv {
  readonly PUBLIC_DIRECTUS_URL: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_ENABLE_VISUAL_EDITING: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY: string;
  readonly DIRECTUS_SERVER_TOKEN: string;
  readonly DIRECTUS_ADMIN_TOKEN: string;
  readonly RECAPTCHA_SECRET_KEY: string;
  readonly RECAPTCHA_SCORE_THRESHOLD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: { id: string; email?: string; first_name?: string; last_name?: string; provider?: string | null; external_identifier?: string | null };
    contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
    token: string;
  }
}
