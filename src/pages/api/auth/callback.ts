import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { createUserClient } from '@/lib/directus/directus';
import type { Schema } from '@/types/directus-schema';

export const GET: APIRoute = async ({ url, redirect }) => {
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

    // Set HTTP-Only cookie và redirect trong cùng 1 response
    // Dùng Response thay vì cookies.set() + redirect() để đảm bảo
    // cookie được set trước khi browser follow redirect
    const destination = contact?.phone
      ? '/tai-khoan'
      : '/tai-khoan/cap-nhat-thong-tin';

    const cookieValue = `auth_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        'Set-Cookie': cookieValue,
      },
    });
  } catch (err) {
    console.error('Auth callback error:', err);
    return redirect('/login?error=auth_failed');
  }
};
