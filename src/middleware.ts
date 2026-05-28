import { defineMiddleware } from 'astro:middleware';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';

interface AuthLocals {
  user: { id: string; email?: string; first_name?: string; last_name?: string; avatar?: string | { id: string } | null; provider?: string | null; external_identifier?: string | null };
  contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
  token: string;
}

const PROTECTED_ROUTES = ['/tai-khoan', '/login', '/dang-ky', '/sso-callback'];
const PUBLIC_AUTH_ROUTES = ['/login', '/dang-ky'];
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

const userFetch = (token: string, path: string) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

const adminFetch = (path: string) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: 'no-store',
  });

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const locals = context.locals as AuthLocals;
  const { pathname } = new URL(url);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return next();

  if (pathname === '/sso-callback') return next();

  const token = cookies.get(AUTH_COOKIE_NAME)?.value;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  if (!token) {
    if (isPublicAuthRoute) return next();
    return context.redirect('/login');
  }

  try {
    const meRes = await userFetch(token, '/users/me?fields=id,email,first_name,last_name,avatar');
    if (!meRes.ok) {
      console.error('[middleware] /users/me failed:', meRes.status, await meRes.text().catch(() => ''));
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }
    const meData = await meRes.json();
    const userId = meData?.data?.id;
    if (!userId) {
      console.error('[middleware] /users/me returned no data');
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }

    const adminUserRes = await adminFetch(`/users/${userId}?fields=id,email,first_name,last_name,avatar,provider,external_identifier`);
    if (!adminUserRes.ok) {
      console.error('[middleware] admin /users/:id failed:', adminUserRes.status, await adminUserRes.text().catch(() => ''));
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }
    const adminUserData = await adminUserRes.json();
    const user = adminUserData?.data;
    if (!user) {
      console.error('[middleware] admin /users/:id returned no data');
      cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
      return context.redirect('/login');
    }

    let contact: any = null;
    try {
      const contactFilter = encodeURIComponent(JSON.stringify({ user: { _eq: user.id } }));
      const cRes = await adminFetch(`/items/contacts?fields=id,phone,first_name,last_name&filter=${contactFilter}&limit=1`);
      if (cRes.ok) {
        const cData = await cRes.json().catch(() => null);
        contact = cData?.data?.[0] ?? null;
      }
    } catch (cErr) {
      console.error('[middleware] contacts fetch error:', cErr);
    }

    locals.user = user;
    locals.contact = contact;
    locals.token = token;

    if (isPublicAuthRoute) {
      return context.redirect('/tai-khoan');
    }

    const response = await next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  } catch (err) {
    console.error('[middleware] auth check failed:', err);
    cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
    return context.redirect('/login');
  }
});
