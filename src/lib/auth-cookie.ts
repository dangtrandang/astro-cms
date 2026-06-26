export const AUTH_COOKIE_NAME = 'auth_token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 3600,
} as const;

export const AUTH_COOKIE_OPTIONS_LONG = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 604800,
} as const;
