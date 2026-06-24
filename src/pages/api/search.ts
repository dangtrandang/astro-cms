import type { APIRoute } from 'astro';
import { searchContent } from '@/lib/directus/fetchers';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('query');

  if (!query || query.trim() === '') {
    return new Response(JSON.stringify({ data: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await searchContent(query.trim());

    return new Response(JSON.stringify({ data: results }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
