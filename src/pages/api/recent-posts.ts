import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import type { Schema } from '@/types/directus-schema';

export const GET: APIRoute = async () => {
    try {
        const url = import.meta.env.PUBLIC_DIRECTUS_URL as string;
        const token = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

        const client = createDirectus<Schema>(url)
            .with(staticToken(token))
            .with(rest());

        const posts = await client.request(
            readItems('posts', {
                limit: 3,
                sort: ['-date_created'],
                fields: ['id', 'title', 'image', 'Slug', 'date_created'] as any[],
                filter: { status: { _eq: 'published' } },
            }),
        );
        return new Response(JSON.stringify({ posts }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error('[recent-posts]', e);
        return new Response(JSON.stringify({ posts: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
