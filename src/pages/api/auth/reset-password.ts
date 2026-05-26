import type { APIRoute } from 'astro';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;

export const POST: APIRoute = async ({ request }) => {
  let token: string;
  let password: string;

  try {
    const body = await request.json();
    token = (body.token as string)?.trim() || '';
    password = (body.password as string)?.trim() || '';
  } catch {
    return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!token || !password) {
    return new Response(JSON.stringify({ error: 'Thiếu token hoặc mật khẩu' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (password.length < 8) {
    return new Response(JSON.stringify({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resetRes = await fetch(`${DIRECTUS_URL}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    if (!resetRes.ok) {
      const errBody = await resetRes.text().catch(() => '');
      if (resetRes.status === 401 || resetRes.status === 400) {
        return new Response(JSON.stringify({ error: 'Token không hợp lệ hoặc đã hết hạn' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.error('[reset-password] /auth/password/reset failed:', resetRes.status, errBody.slice(0, 200));
      return new Response(JSON.stringify({ error: 'Không thể đặt lại mật khẩu, thử lại sau' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, redirect: '/login' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[reset-password] error:', err);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ, vui lòng thử lại sau' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
