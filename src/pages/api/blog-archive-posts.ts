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
    const tag = url.searchParams.get('tag') ?? '';
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

    // Tag filter: dùng Directus nested M2M deep filter thay vì client-side
    if (tag) {
      andConditions.push({
        tags: {
          tags_id: { slug: { _eq: tag } },
        },
      });
    }

    const filter = andConditions.length > 1 ? { _and: andConditions } : andConditions[0];
    const sortDir = sortMode === 'oldest' ? 'date_published' : '-date_published';

    // Directus aggregate() không hỗ trợ deep nested filter (M2M).
    // → Khi có tag, fetch toàn bộ rồi đếm + paginate client-side.
    const hasTagFilter = !!tag;

    const readParams: any = {
      filter: filter as any,
      sort: [sortDir] as any[],
      limit: hasTagFilter ? -1 : limit,
      page: hasTagFilter ? 1 : page,
      fields: [
        'id',
        'title',
        'summary',
        'content',
        'Slug',
        'image',
        'date_published',
        { tags: [{ tags_id: ['name', 'slug'] }] },
        { category: ['id', 'title', 'slug'] },
        { author: ['id', 'name', 'image'] },
      ],
    };

    // aggregate dùng filter KHÔNG có nested tag filter để tránh lỗi
    const aggregateFilter = hasTagFilter
      ? andConditions.filter((c: any) => !c.tags).length > 1
        ? { _and: andConditions.filter((c: any) => !c.tags) }
        : andConditions.filter((c: any) => !c.tags)[0]
      : filter;

    const [rawPosts, countResponse] = await Promise.all([
      client.request(readItems('posts', readParams)),
      client.request(
        aggregate('posts', {
          aggregate: { count: '*' },
          filter: aggregateFilter as any,
        }),
      ),
    ]);

    let posts: any[] = rawPosts as any[];

    if (hasTagFilter) {
      const totalCount = posts.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const offset = (page - 1) * limit;
      posts = posts.slice(offset, offset + limit);

      return new Response(JSON.stringify({ posts, totalCount, totalPages }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
