import type { APIRoute } from 'astro';
import { createUserClient } from '@/lib/directus/directus';
import { updateItem, readItems } from '@directus/sdk';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return new Response(null, { status: 401 });
  }

  const formData = await request.formData();
  const phone = (formData.get('phone') as string)?.trim();
  const first_name = (formData.get('first_name') as string)?.trim();
  const last_name = (formData.get('last_name') as string)?.trim();

  if (!phone) {
    return new Response(null, { status: 400 });
  }

  try {
    const client = createUserClient(token);

    const contacts = (await client.request(
      readItems('contacts', { fields: ['id'], limit: 1 }),
    )) as any[];

    const contactId = contacts[0]?.id;
    if (!contactId) {
      return new Response(null, { status: 400 });
    }

    await client.request(
      updateItem('contacts', contactId, {
        phone,
        first_name: first_name || undefined,
        last_name: last_name || undefined,
      }),
    );

    return new Response(null, {
      status: 302,
      headers: { Location: '/tai-khoan' },
    });
  } catch (err) {
    console.error('Update contact error:', err);
    return new Response(null, { status: 500 });
  }
};
