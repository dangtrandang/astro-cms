import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, createItem, updateItem } from '@directus/sdk';
import { createUserClient } from '@/lib/directus/directus';
import type { Schema } from '@/types/directus-schema';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
const GOOGLE_ROLE_ID = '0ef5375a-2de5-4e25-bcd4-3eecfcca53b8';
const GOOGLE_POLICY_ID = '32a88764-75b9-4d17-a740-0d9852186858';

const ensureUserConfig = async (adminClient: any, userId: string) => {
  const userItem = (await adminClient.request(
    readItems('directus_users', {
      fields: ['id', 'role'],
      filter: { id: { _eq: userId } },
      limit: 1,
    }),
  )) as any[];

  const user = userItem[0];
  if (!user) return null;

  if (user.role !== GOOGLE_ROLE_ID) {
    await adminClient.request(
      updateItem('directus_users', userId, {
        role: GOOGLE_ROLE_ID,
      }),
    );
  }

  const existingPolicyLinks = (await adminClient.request(
    readItems('directus_access', {
      fields: ['id'],
      filter: {
        user: { _eq: userId },
        policy: { _eq: GOOGLE_POLICY_ID },
      },
      limit: 1,
    }),
  )) as any[];

  if (!existingPolicyLinks[0]) {
    await adminClient.request(
      createItem('directus_access', {
        user: userId,
        role: GOOGLE_ROLE_ID,
        policy: GOOGLE_POLICY_ID,
      }),
    );
  }

  return user;
};

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    const refreshRes = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: 'session' }),
    });

    if (!refreshRes.ok) {
      return redirect('/login?error=refresh_failed');
    }

    const refreshData = await refreshRes.json();
    const accessToken = refreshData?.data?.access_token;
    if (!accessToken) {
      return redirect('/login?error=no_token');
    }

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

    await ensureUserConfig(adminClient, user.id);

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
