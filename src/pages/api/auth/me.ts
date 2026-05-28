import type { APIRoute } from 'astro';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name,avatar`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meRes.ok) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const meData = await meRes.json();
    const user = meData?.data;

    if (!user) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let avatarUrl: string | null = null;
    if (user.avatar) {
      if (typeof user.avatar === 'string') {
        avatarUrl = `${DIRECTUS_URL}/assets/${user.avatar}`;
      } else if (typeof user.avatar === 'object' && user.avatar?.id) {
        avatarUrl = `${DIRECTUS_URL}/assets/${user.avatar.id}`;
      }
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        avatarUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
