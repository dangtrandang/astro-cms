import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { createUserClient } from '@/lib/directus/directus';
import type { Schema } from '@/types/directus-schema';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const accessToken = (formData.get('token') as string)?.trim();

  if (!accessToken) {
    return redirect('/login?error=missing_token');
  }

  try {
    const adminClient = createDirectus<Schema>(DIRECTUS_URL)
      .with(staticToken(ADMIN_TOKEN))
      .with(rest());

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

    const destination = contact?.phone
      ? '/tai-khoan'
      : '/tai-khoan/cap-nhat-thong-tin';

    const cookieValue = `auth_token=${accessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`;

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
