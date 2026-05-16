import type { APIRoute } from 'astro';
import { createDirectus, readItems, rest, staticToken } from '@directus/sdk';
import type { Schema } from '@/types/directus-schema';

export const GET: APIRoute = async ({ url }) => {
    try {
        const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL as string;
        const token = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

        const client = createDirectus<Schema>(directusUrl).with(staticToken(token)).with(rest());

        const authorId = url.searchParams.get('author_id') ?? '';
        const categoryIds = (url.searchParams.get('category_ids') ?? '')
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);

        const andConditions: any[] = [
            { status: { _eq: 'published' } },
            { date_published: { _nnull: true } },
        ];

        if (authorId) {
            andConditions.push({ author: { _eq: authorId } });
        }

        if (categoryIds.length > 0) {
            andConditions.push({ category: { id: { _in: categoryIds } } });
        }

        const filter = andConditions.length > 1 ? { _and: andConditions } : andConditions[0];

        // Fetch all published dates (only date_published field, no limit)
        const posts = await client.request(
            readItems('posts', {
                filter: filter as any,
                fields: ['date_published'] as any[],
                limit: -1,
                sort: ['-date_published'] as any[],
            }),
        );

        // Extract unique year-month values from dates
        const monthSet = new Set<string>();
        for (const post of posts as any[]) {
            if (post.date_published) {
                const d = new Date(post.date_published);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthSet.add(key);
            }
        }

        // Sort descending (newest month first)
        const months = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

        return new Response(JSON.stringify({ months }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ months: [], error: String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
