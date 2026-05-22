import { defineMiddleware } from 'astro:middleware';
import { createUserClient } from '@/lib/directus/directus';
import { readItems } from '@directus/sdk';

interface AuthLocals {
  user: { id: string; email?: string; first_name?: string; last_name?: string };
  contact: { id: string; phone?: string; first_name?: string; last_name?: string } | null;
  token: string;
}

const PROTECTED_ROUTES = ['/tai-khoan', '/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const locals = context.locals as AuthLocals;
  const { pathname } = new URL(url);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return next();

  const token = cookies.get('auth_token')?.value;

  if (!token) {
    if (pathname === '/login') return next();
    return context.redirect('/login');
  }

  try {
    const client = createUserClient(token);
    const [users, contactList] = await Promise.all([
      client.request(
        readItems('directus_users', { fields: ['id', 'email', 'first_name', 'last_name'], limit: 1 }),
      ) as Promise<any[]>,
      client.request(
        readItems('contacts', {
          fields: ['id', 'phone', 'first_name', 'last_name'],
          limit: 1,
        }),
      ) as Promise<any[]>,
    ]);

    const user = users[0] ?? null;
    if (!user) {
      cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login');
    }

    const contact = contactList[0] ?? null;

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
  } catch {
    cookies.delete('auth_token', { path: '/' });
    return context.redirect('/login');
  }
});
