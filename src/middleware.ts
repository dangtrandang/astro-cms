import { defineMiddleware } from 'astro:middleware';

interface AuthLocals {
  user: { id: string; email?: string; first_name?: string; last_name?: string };
  contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
  token: string;
}

const PROTECTED_ROUTES = ['/tai-khoan', '/login', '/sso-callback'];
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;

const userFetch = (token: string, path: string) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const locals = context.locals as AuthLocals;
  const { pathname } = new URL(url);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return next();

  if (pathname === '/sso-callback') return next();

  const token = cookies.get('auth_token')?.value;

  if (!token) {
    if (pathname === '/login') return next();
    return context.redirect('/login');
  }

  try {
    const meRes = await userFetch(token, '/users/me?fields=id,email,first_name,last_name');
    if (!meRes.ok) {
      console.error('[middleware] /users/me failed:', meRes.status, await meRes.text().catch(() => ''));
      cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login');
    }
    const meData = await meRes.json();
    const user = meData?.data;
    if (!user) {
      console.error('[middleware] /users/me returned no data');
      cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login');
    }

    let contact: any = null;
    try {
      const contactFilter = encodeURIComponent(JSON.stringify({ user: { _eq: user.id } }));
      const cRes = await userFetch(token, `/items/contacts?fields=id,phone,first_name,last_name&filter=${contactFilter}&limit=1`);
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

    if (pathname === '/login') {
      return context.redirect('/tai-khoan');
    }

    if (contact && !contact.phone && pathname !== '/tai-khoan/cap-nhat-thong-tin') {
      return context.redirect('/tai-khoan/cap-nhat-thong-tin');
    }

    if (contact?.phone && pathname === '/tai-khoan/cap-nhat-thong-tin') {
      return context.redirect('/tai-khoan');
    }

    return next();
  } catch (err) {
    console.error('[middleware] auth check failed:', err);
    cookies.delete('auth_token', { path: '/' });
    return context.redirect('/login');
  }
});
