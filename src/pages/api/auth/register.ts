import type { APIRoute } from 'astro';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
const CUSTOMER_ROLE = '0ef5375a-2de5-4e25-bcd4-3eecfcca53b8';
const CUSTOMER_POLICY = '32a88764-75b9-4d17-a740-0d9852186858';

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
  let email: string;
  let password: string;
  let firstName: string;
  let lastName: string;

  try {
    const body = await request.json();
    email = (body.email as string)?.trim();
    password = (body.password as string)?.trim();
    firstName = (body.first_name as string)?.trim() || '';
    lastName = (body.last_name as string)?.trim() || '';

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập đầy đủ Email và Mật khẩu' }), {
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
  } catch {
    return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if email already exists (exclude archived/deleted users)
  const emailFilter = encodeURIComponent(JSON.stringify({
    email: { _eq: email },
    status: { _neq: 'archived' },
  }));
  const existingRes = await adminFetch(
    `/users?fields=id,email,provider,status&filter=${emailFilter}&limit=1`,
  );

  if (!existingRes.ok) {
    return new Response(JSON.stringify({ error: 'Lỗi kiểm tra tài khoản, thử lại sau' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existingData = await existingRes.json().catch(() => null);
  const existingUser = existingData?.data?.[0];

  if (existingUser) {
    if (existingUser.provider === 'google') {
      return new Response(
        JSON.stringify({
          error: 'Email này đã được liên kết nhanh với Google. Vui lòng bấm nút "Đăng nhập với Google" ở dưới để vào ngay.',
          code: 'GOOGLE_LINKED',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return new Response(
      JSON.stringify({
        error: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc khôi phục mật khẩu.',
        code: 'EMAIL_EXISTS',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Create user
  const createRes = await adminFetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      role: CUSTOMER_ROLE,
      provider: 'default',
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Không thể tạo tài khoản: ${errBody.slice(0, 200)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const createData = await createRes.json().catch(() => null);
  const newUser = createData?.data;
  if (!newUser?.id) {
    return new Response(JSON.stringify({ error: 'Tạo tài khoản thất bại, không nhận được ID' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Ensure policy link
  try {
    const accessFilter = encodeURIComponent(
      JSON.stringify({ user: { _eq: newUser.id }, policy: { _eq: CUSTOMER_POLICY } }),
    );
    const accessRes = await adminFetch(`/items/directus_access?fields=id&filter=${accessFilter}&limit=1`);
    const accessData = await accessRes.json().catch(() => null);
    if (!accessData?.data?.[0]) {
      await adminFetch('/items/directus_access', {
        method: 'POST',
        body: JSON.stringify({
          user: newUser.id,
          role: CUSTOMER_ROLE,
          policy: CUSTOMER_POLICY,
        }),
      });
    }
  } catch {
    // non-fatal if policy link fails
  }

  // Create contact
  try {
    await adminFetch('/items/contacts', {
      method: 'POST',
      body: JSON.stringify({
        user: newUser.id,
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      }),
    });
  } catch {
    // non-fatal, sso-callback will handle on next login
  }

  // Login to get access token
  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, mode: 'json' }),
  });

  if (!loginRes.ok) {
    return new Response(JSON.stringify({ success: true, auto_login: false }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const loginData = await loginRes.json().catch(() => null);
  const accessToken = loginData?.data?.access_token;

  if (!accessToken) {
    return new Response(JSON.stringify({ success: true, auto_login: false }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  cookies.set('auth_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 604800,
  });

  return new Response(JSON.stringify({ success: true, redirect: '/tai-khoan' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
