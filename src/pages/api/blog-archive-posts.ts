import type { APIRoute } from 'astro';
import { createDirectus, rest, staticToken, readItems, aggregate } from '@directus/sdk';
import type { Schema } from '@/types/directus-schema';

export const GET: APIRoute = async ({ url }) => {
  try {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL as string;
    const token = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

    const client = createDirectus<Schema>(directusUrl).with(staticToken(token)).with(rest());

    const limit = Math.min(Number(url.searchParams.get('limit') ?? '10'), 50);
    const page = Math.max(Number(url.searchParams.get('page') ?? '1'), 1);
    const categorySlug = url.searchParams.get('category_slug') ?? '';
    const authorId = url.searchParams.get('author_id') ?? '';
    const sortMode = url.searchParams.get('sort') ?? 'newest';
    const filterMonth = url.searchParams.get('month') ?? ''; // format: "2025-07"
    const categoryIds = (url.searchParams.get('category_ids') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    // Support both legacy public category slug filtering and CMS-configured category ids.
    const andConditions: any[] = [{ status: { _eq: 'published' } }];

    if (categoryIds.length > 0) {
      andConditions.push({ category: { id: { _in: categoryIds } } });
    } else if (categorySlug && categorySlug !== 'all') {
      andConditions.push({ category: { slug: { _eq: categorySlug } } });
    }

    if (authorId) {
      andConditions.push({ author: { _eq: authorId } });
    }

    // Filter by month/year if provided (format: "2025-07")
    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      if (year && month) {
        const startDate = `${year}-${month}-01T00:00:00`;
        const nextMonth = Number(month) === 12 ? `${Number(year) + 1}-01-01T00:00:00` : `${year}-${String(Number(month) + 1).padStart(2, '0')}-01T00:00:00`;
        andConditions.push({ date_published: { _gte: startDate } });
        andConditions.push({ date_published: { _lt: nextMonth } });
      }
    }

    const filter = andConditions.length > 1 ? { _and: andConditions } : andConditions[0];
    const sortDir = sortMode === 'oldest' ? 'date_published' : '-date_published';

    const [posts, countResponse] = await Promise.all([
      client.request(
        readItems('posts', {
          filter: filter as any,
          sort: [sortDir] as any[],
          limit,
          page,
          fields: [
            'id',
            'title',
            'summary',
            'content',
            'Slug',
            'image',
            'date_published',
            'tags',
            { category: ['id', 'title', 'slug'] },
            { author: ['id', 'name', 'image'] },
          ] as any[],
        }),
      ),
      client.request(
        aggregate('posts', {
          aggregate: { count: '*' },
          filter: filter as any,
        }),
      ),
    ]);

    const totalCount = Number((countResponse as any)[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return new Response(JSON.stringify({ posts, totalCount, totalPages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[blog-archive-posts]', e);
    return new Response(JSON.stringify({ posts: [], totalCount: 0, totalPages: 0 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
