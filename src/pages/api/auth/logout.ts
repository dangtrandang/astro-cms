import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return redirect('/');
};
