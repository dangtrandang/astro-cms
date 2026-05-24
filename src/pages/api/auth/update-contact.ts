import type { APIRoute } from 'astro';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

const adminFetch = (path: string, init?: RequestInit) =>
  fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let phone: string | undefined;
  let first_name: string | undefined;
  let last_name: string | undefined;
  let contactId: string | undefined;
  let isJson = false;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    contactId = body.contactId;
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

  try {
    if (!contactId) {
      const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json().catch(() => null);
      const userId = meData?.data?.id;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Không xác định được người dùng' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const contactFilter = encodeURIComponent(JSON.stringify({ user: { _eq: userId } }));
      const cRes = await adminFetch(`/items/contacts?fields=id&filter=${contactFilter}&limit=1`);
      const cData = await cRes.json().catch(() => null);
      contactId = cData?.data?.[0]?.id;
      if (!contactId) {
        return new Response(JSON.stringify({ error: 'Không tìm thấy contact' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const body: Record<string, string | undefined> = { phone };
    if (first_name) body.first_name = first_name;
    if (last_name) body.last_name = last_name;

    const patchRes = await adminFetch(`/items/contacts/${contactId}?fields=id,phone,first_name,last_name`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    if (!patchRes.ok) {
      const errBody = await patchRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: `Không thể cập nhật: ${errBody.slice(0, 200)}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const patchData = await patchRes.json().catch(() => null);
    const updated = patchData?.data;

    if (isJson) {
      return new Response(JSON.stringify({ success: true, contact: updated || null }), {
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
