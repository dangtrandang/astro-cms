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

export const POST: APIRoute = async ({ request }) => {
  let email: string;

  try {
    const body = await request.json();
    email = (body.email as string)?.trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Vui lòng nhập email hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const emailFilter = encodeURIComponent(JSON.stringify({
      email: { _eq: email },
      status: { _neq: 'archived' },
    }));
    const userRes = await adminFetch(`/users?fields=id,email,provider&filter=${emailFilter}&limit=1`);

    if (!userRes.ok) {
      return new Response(JSON.stringify({
        success: true,
        code: 'PASSWORD_RESET_EMAIL_SENT',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData = await userRes.json().catch(() => null);
    const user = userData?.data?.[0];

    if (!user) {
      return new Response(JSON.stringify({
        success: true,
        code: 'PASSWORD_RESET_EMAIL_SENT',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.provider === 'google') {
      return new Response(JSON.stringify({
        error: 'Email này đang sử dụng đăng nhập Google. Vui lòng bấm nút "Đăng nhập với Google".',
        code: 'GOOGLE_ACCOUNT',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pwRes = await fetch(`${DIRECTUS_URL}/auth/password/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!pwRes.ok) {
      const errBody = await pwRes.text().catch(() => '');
      console.error('[forgot-password] /auth/password/request failed:', pwRes.status, errBody.slice(0, 200));
    }

    return new Response(JSON.stringify({
      success: true,
      code: 'PASSWORD_RESET_EMAIL_SENT',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[forgot-password] error:', err);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ, vui lòng thử lại sau' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
