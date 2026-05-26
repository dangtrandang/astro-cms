import type { APIRoute } from 'astro';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth-cookie';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_THRESHOLD = Number(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const params = new URLSearchParams();
  params.set('secret', RECAPTCHA_SECRET!);
  params.set('response', token);

  const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const result = await googleRes.json();
  return {
    success: result.success && (result.score ?? 0) >= RECAPTCHA_THRESHOLD,
    score: result.score ?? 0,
  };
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let email: string;
  let password: string;
  let recaptchaToken: string | undefined;

  try {
    const body = await request.json();
    email = (body.email as string)?.trim();
    password = (body.password as string)?.trim();
    recaptchaToken = body.recaptchaToken as string | undefined;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập Email và Mật khẩu' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (RECAPTCHA_SECRET) {
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: 'Xác minh bảo mật thất bại, vui lòng thử lại' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { success } = await verifyRecaptcha(recaptchaToken);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Xác minh bảo mật thất bại, vui lòng thử lại' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Lỗi xác minh bảo mật, vui lòng thử lại' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mode: 'json' }),
    });

    if (!loginRes.ok) {
      const status = loginRes.status;
      if (status === 401 || status === 403) {
        return new Response(JSON.stringify({ error: 'Email hoặc mật khẩu không đúng' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const errBody = await loginRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: `Lỗi đăng nhập: ${errBody.slice(0, 200)}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const loginData = await loginRes.json().catch(() => null);
    const accessToken = loginData?.data?.access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Đăng nhập thất bại, không nhận được token' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    cookies.set(AUTH_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS);

    return new Response(
      JSON.stringify({ success: true, redirect: '/tai-khoan' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Lỗi kết nối: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
