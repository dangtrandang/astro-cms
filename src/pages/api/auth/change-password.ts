import type { APIRoute } from 'astro';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth-cookie';

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
  const token = cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let newPassword: string;
  let currentPassword: string;
  try {
    const body = await request.json();
    newPassword = (body.password as string)?.trim();
    currentPassword = (body.current_password as string)?.trim();
    if (!newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!currentPassword) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập mật khẩu hiện tại' }), {
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

  const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) {
    cookies.delete(AUTH_COOKIE_NAME, { path: AUTH_COOKIE_OPTIONS.path });
    return new Response(JSON.stringify({ error: 'Phiên đăng nhập hết hạn' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const meData = await meRes.json().catch(() => null);
  const userId = meData?.data?.id;
  const userEmail = meData?.data?.email;

  if (!userId || !userEmail) {
    return new Response(JSON.stringify({ error: 'Không xác định được người dùng' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify current password via Directus login
  const verifyRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, password: currentPassword, mode: 'json' }),
  });

  if (!verifyRes.ok) {
    return new Response(JSON.stringify({ error: 'Mật khẩu hiện tại không đúng' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminUserRes = await adminFetch(`/users/${userId}?fields=id,email,provider`);
  if (!adminUserRes.ok) {
    return new Response(JSON.stringify({ error: 'Không thể kiểm tra tài khoản' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminUserData = await adminUserRes.json().catch(() => null);
  const currentProvider = adminUserData?.data?.provider;

  if (currentProvider !== 'default') {
    return new Response(
      JSON.stringify({ error: 'Tài khoản Google cần chuyển đổi trước khi đổi mật khẩu' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const patchRes = await adminFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ password: newPassword }),
  });

  if (!patchRes.ok) {
    const errBody = await patchRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Không thể cập nhật mật khẩu: ${errBody.slice(0, 200)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Mật khẩu đã được cập nhật thành công' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
