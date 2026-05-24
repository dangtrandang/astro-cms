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

  let newPassword: string;
  try {
    const body = await request.json();
    newPassword = (body.password as string)?.trim();
    if (!newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }), {
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

  // Step 1: user token to verify session + get userId
  const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) {
    cookies.delete('auth_token', { path: '/' });
    return new Response(JSON.stringify({ error: 'Phiên đăng nhập hết hạn' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const meData = await meRes.json().catch(() => null);
  const userId = meData?.data?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Không xác định được người dùng' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Step 2: admin token to get provider (bypass Customer role field-level permissions)
  const adminUserRes = await adminFetch(`/users/${userId}?fields=id,email,provider`);
  if (!adminUserRes.ok) {
    return new Response(JSON.stringify({ error: 'Không thể kiểm tra tài khoản' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminUserData = await adminUserRes.json().catch(() => null);
  const currentProvider = adminUserData?.data?.provider;

  // Only allow conversion from google to default
  if (currentProvider !== 'google') {
    return new Response(
      JSON.stringify({ error: 'Tài khoản của bạn đã sử dụng mật khẩu, không cần chuyển đổi' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Cut Google link: set password, change provider to default, clear external_identifier
  const patchRes = await adminFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      password: newPassword,
      provider: 'default',
      external_identifier: null,
    }),
  });

  if (!patchRes.ok) {
    const errBody = await patchRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Không thể cập nhật tài khoản: ${errBody.slice(0, 200)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Tài khoản của bạn đã được bảo vệ bằng mật khẩu riêng. Bạn sẽ không thể đăng nhập nhanh bằng Google được nữa.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
