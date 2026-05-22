import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { createUserClient } from '@/lib/directus/directus';
import type { Schema } from '@/types/directus-schema';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const accessToken = url.searchParams.get('access_token');

  if (!accessToken) {
    return redirect('/login?error=missing_token');
  }

  try {
    // Dùng Admin Token (DIRECTUS_SERVER_TOKEN) để đọc/ghi contacts —
    // user mới (role Customer) chưa có quyền create trên collection contacts
    const adminToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
    const adminClient = createDirectus<Schema>(import.meta.env.PUBLIC_DIRECTUS_URL as string)
      .with(staticToken(adminToken))
      .with(rest());

    // Dùng user token để đọc thông tin chính user đó
    const userClient = createUserClient(accessToken);
    const users = (await userClient.request(
      readItems('directus_users', {
        fields: ['id', 'email', 'first_name', 'last_name'],
        limit: 1,
      }),
    )) as any[];

    const user = users[0];
    if (!user) {
      return redirect('/login?error=user_not_found');
    }

    const existingContacts = (await adminClient.request(
      readItems('contacts', {
        fields: ['id', 'phone'],
        filter: { user: { _eq: user.id } },
        limit: 1,
      }),
    )) as any[];

    let contact = existingContacts[0] ?? null;

    if (!contact) {
      contact = (await adminClient.request(
        createItem('contacts', {
          user: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        }),
      )) as any;
    }

    // Set HTTP-Only cookie with JWT
    cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect to onboarding if phone missing, otherwise dashboard
    if (!contact.phone) {
      return redirect('/tai-khoan/cap-nhat-thong-tin');
    }
    return redirect('/tai-khoan');
  } catch (err) {
    console.error('Auth callback error:', err);
    return redirect('/login?error=auth_failed');
  }
};
