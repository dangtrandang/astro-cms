import type { APIRoute } from 'astro';
import { createUserClient } from '@/lib/directus/directus';
import { updateItem, readItems } from '@directus/sdk';

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return new Response(null, { status: 401 });
  }

  let phone: string | undefined;
  let first_name: string | undefined;
  let last_name: string | undefined;
  let isJson = false;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    phone = body.phone?.trim();
    first_name = body.first_name?.trim();
    last_name = body.last_name?.trim();
    isJson = true;
  } else {
    const formData = await request.formData();
    phone = (formData.get('phone') as string)?.trim();
    first_name = (formData.get('first_name') as string)?.trim();
    last_name = (formData.get('last_name') as string)?.trim();
  }

  if (!phone) {
    return new Response(JSON.stringify({ error: 'Số điện thoại là bắt buộc' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = createUserClient(token);

    const contacts = (await client.request(
      readItems('contacts', { fields: ['id'], limit: 1 }),
    )) as any[];

    const contactId = contacts[0]?.id;
    if (!contactId) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy contact' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await client.request(
      updateItem('contacts', contactId, {
        phone,
        first_name: first_name || undefined,
        last_name: last_name || undefined,
      }),
    );

    if (isJson) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/tai-khoan' },
    });
  } catch (err) {
    console.error('Update contact error:', err);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
