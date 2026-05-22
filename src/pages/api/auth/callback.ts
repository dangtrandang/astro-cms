import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk';
import { createUserClient } from '@/lib/directus/directus';
import type { Schema } from '@/types/directus-schema';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const ADMIN_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
const SITE_URL = import.meta.env.PUBLIC_SITE_URL as string;

export const GET: APIRoute = async () => {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Đang xử lý đăng nhập...</title></head>
<body>
<script>
(async()=>{
 try{
  const r=await fetch("${DIRECTUS_URL}/auth/refresh",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"session"})});
  if(!r.ok){window.location.href="/login?error=refresh_failed";return}
  const d=await r.json();
  const t=d?.data?.access_token;
  if(!t){window.location.href="/login?error=missing_token";return}
  const f=document.createElement("form");
  f.method="POST";
  f.action="${SITE_URL}/api/auth/callback";
  const i=document.createElement("input");
  i.type="hidden";
  i.name="token";
  i.value=t;
  f.appendChild(i);
  document.body.appendChild(f);
  f.submit();
 }catch{window.location.href="/login?error=auth_failed"}
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const accessToken = (formData.get('token') as string)?.trim();

  if (!accessToken) {
    return redirect('/login?error=missing_token');
  }

  try {
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
