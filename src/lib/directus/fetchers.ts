import type { BlockPost, DirectusUser, Page, Post, Schema } from '@/types/directus-schema';
import type { QueryFilter } from '@directus/sdk';
import { aggregate as sdkAggregate, createDirectus, readItems as sdkReadItems, rest, staticToken } from '@directus/sdk';
import { useDirectus } from './directus';

const { directus, readItems, readItem, readSingleton, aggregate, withToken } = useDirectus();

/** Tạo Directus client với static token — dùng cho server-side fetches cần auth */
const createAuthClient = (token: string) =>
  createDirectus<Schema>(import.meta.env.PUBLIC_DIRECTUS_URL as string)
    .with(staticToken(token))
    .with(rest());

/**
 * Page fields configuration for Directus queries
 *
 * This defines the complete field structure for pages including:
 * - Basic page metadata (title, id)
 * - SEO fields for search engine optimization
 * - Complex nested content blocks (hero, gallery, pricing, forms, etc.)
 * - All nested relationships and dynamic content fields
 */
const pageFields = [
  'title',
  'seo',
  'id',
  {
    blocks: [
      'id',
      'collection',
      'item',
      'sort',
      'hide_block',
      {
        item: {
          block_hero: [
            'id',
            'title',
            'headline',
            'content',
            'image',
            'image_position',
            {
              button_group: [
                'id',
                {
                  buttons: [
                    'id',
                    'label',
                    'variant',
                    'color',
                    'type',
                    'external_url',
                    { page: ['permalink'] },
                  ],
                },
              ],
            },
          ] as any,
          block_blog_archive: [
            'id',
            'headline',
            'author_filter',
            {
              categories: [{ categories_id: ['id', 'title', 'slug'] }],
            },
          ] as any,
        },
      },
    ],
  },
] as const;

const blogArchivePostFields = [
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
] as any[];

const BLOG_ARCHIVE_PAGE_SIZE = 9;

const enrichBlogArchiveBlocks = async (page: Page, token?: string) => {
  const blocks = Array.isArray(page.blocks) ? [...page.blocks] : [];
  if (!blocks.length) return page;

  const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
  const client = createAuthClient(token || serverToken);

  const enrichedBlocks = await Promise.all(
    blocks.map(async (block: any) => {
      if (block?.collection !== 'block_blog_archive' || !block.item || typeof block.item !== 'object') {
        return block;
      }

      const blockItem = block.item as any;
      const categoryIds = Array.isArray(blockItem.categories)
        ? blockItem.categories
          .map((entry: any) => entry?.categories_id?.id ?? entry?.categories_id)
          .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
        : [];

      const andConditions: any[] = [{ status: { _eq: 'published' } }];

      if (blockItem.author_filter) {
        andConditions.push({ author: { _eq: blockItem.author_filter } });
      }

      if (categoryIds.length > 0) {
        andConditions.push({ category: { _in: categoryIds } });
      }

      const filter = andConditions.length > 1 ? { _and: andConditions } : andConditions[0];
      const sortDir = blockItem.sort_mode === 'oldest' ? 'date_published' : '-date_published';

      const [posts, countResponse] = await Promise.all([
        client.request(
          sdkReadItems('posts', {
            filter: filter as any,
            sort: [sortDir] as any[],
            limit: BLOG_ARCHIVE_PAGE_SIZE,
            page: 1,
            fields: blogArchivePostFields,
          }),
        ),
        client.request(
          sdkAggregate('posts', {
            aggregate: { count: '*' },
            filter: filter as any,
          }),
        ),
      ]);

      const totalCount = Number((countResponse as any)[0]?.count ?? 0);

      return {
        ...block,
        item: {
          ...blockItem,
          posts,
          totalCount,
          totalPages: Math.max(1, Math.ceil(totalCount / BLOG_ARCHIVE_PAGE_SIZE)),
        },
      };
    }),
  );

  return {
    ...page,
    blocks: enrichedBlocks,
  };
};

/**
 * Fetches page data by permalink, including all nested blocks and dynamically fetching blog posts if required.
 */
export const fetchPageData = async (
  permalink: string,
  postPage = 1,
  token?: string,
  preview?: boolean,
): Promise<Page> => {
  try {
    const authToken = token || (import.meta.env.DIRECTUS_SERVER_TOKEN as string);

    const pageData = (await directus.request(
      withToken(
        authToken,
        readItems('pages', {
          filter:
            preview && token
              ? { permalink: { _eq: permalink } }
              : { permalink: { _eq: permalink }, status: { _eq: 'published' } },
          limit: 1,
          fields: pageFields,
          deep: {
            blocks: {
              _sort: ['sort'],
              _filter: { hide_block: { _neq: true } },
            },
          },
        }),
      ),
    )) as Page[];

    if (!pageData.length) {
      throw new Error('Page not found');
    }

    return enrichBlogArchiveBlocks(pageData[0], token);
  } catch {
    throw new Error(`Failed to fetch page with permalink "${permalink}"`);
  }
};

/**
 * Fetches global site data, header navigation, and footer navigation.
 */
export const fetchSiteData = async () => {
  if (!import.meta.env.PUBLIC_DIRECTUS_URL?.trim()) {
    throw new Error('Missing PUBLIC_DIRECTUS_URL. Copy .env.example to .env and set your Directus URL.');
  }

  try {
    const [globals, headerNavigation, footerNavigation] = await Promise.all([
      directus.request(
        readSingleton('globals', {
          fields: ['id', 'title', 'description', 'social_links', 'logo_on_light_bg', 'logo_on_dark_bg'] as any,
        }),
      ),
      directus.request(
        readItem('navigation', 'main', {
          fields: [
            'id',
            'title',
            {
              items: [
                'id',
                'title',
                'url',
                {
                  page: ['permalink'],
                  children: ['id', 'title', 'url', { page: ['permalink'] }],
                },
              ],
            },
          ],
          deep: { items: { _sort: ['sort'] } },
        }),
      ),
      directus.request(
        readItem('navigation', 'footer', {
          fields: [
            'id',
            'title',
            {
              items: [
                'id',
                'title',
                'url',
                {
                  page: ['permalink'],
                  children: ['id', 'title', 'url', { page: ['permalink'] }],
                },
              ],
            },
          ],
        }),
      ),
    ]);

    return { globals, headerNavigation, footerNavigation };
  } catch (error) {
    console.error('fetchSiteData actual error:', JSON.stringify(error, null, 2), error);
    throw new Error(`Failed to fetch site data from Directus: ${error}`);
  }
};

/**
 * Fetches a single blog post by slug. Handles live preview mode
 */
export const fetchPostBySlug = async (slug: string, draft = false, token?: string) => {
  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const filter =
      token || draft
        ? { Slug: { _eq: slug } }
        : { Slug: { _eq: slug }, status: { _eq: 'published' } };

    const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
    const client = createAuthClient(token || serverToken);

    const posts = (await client.request(
      sdkReadItems('posts', {
        filter: filter as any,
        limit: 1,
        fields: [
          'id',
          'title',
          'content',
          'status',
          'date_published',
          'image',
          'summary',
          'Slug',
          'seo',
        ] as any[],
      }),
    )) as unknown as Post[];

    const post = posts.length > 0 ? posts[0] : null;

    if (!post) {
      return null;
    }

    return post;
  } catch (e) {
    console.error('fetchPostBySlug error:', e);
    throw new Error(`Failed to fetch post with slug "${slug}"`);
  }
};

/**
 * Fetches related blog posts excluding the given ID.
 */
export const fetchRelatedPosts = async (excludeId: string) => {
  try {
    const relatedPosts = (await directus.request(
      readItems('posts', {
        filter: { status: { _eq: 'published' }, id: { _neq: excludeId } },
        fields: ['id', 'title', 'image', 'Slug', 'seo'] as any[],
        limit: 2,
      }),
    )) as unknown as Post[];

    return relatedPosts;
  } catch {
    throw new Error('Failed to fetch related posts');
  }
};

/**
 * Fetches author details by ID.
 */
export const fetchAuthorById = async (authorId: string) => {
  const { directus, readUser } = useDirectus();

  try {
    const author = (await directus.request(
      readUser(authorId, {
        fields: ['id', 'first_name', 'last_name', 'avatar'],
      }),
    )) as DirectusUser;

    return author;
  } catch {
    throw new Error(`Failed to fetch author with ID "${authorId}"`);
  }
};

/**
 * Fetches paginated blog posts.
 */
export const fetchPaginatedPosts = async (limit: number, page: number): Promise<Post[]> => {
  try {
    const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
    const client = createAuthClient(serverToken);
    const response = (await client.request(
      sdkReadItems('posts', {
        limit,
        page,
        sort: ['-date_published'] as any[],
        fields: ['id', 'title', 'summary', 'Slug', 'image'] as any[],
        filter: { status: { _eq: 'published' } } as any,
      }),
    )) as unknown as Post[];

    return response;
  } catch {
    throw new Error('Failed to fetch paginated posts');
  }
};

/**
 * Search pages and posts for a given search term
 */
export const searchContent = async (search: string) => {
  try {
    const [pages, posts] = await Promise.all([
      directus.request(
        readItems('pages', {
          filter: {
            _or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
          },
          fields: ['id', 'title', 'permalink', 'seo'],
        }),
      ),
      directus.request(
        readItems('posts', {
          filter: {
            _and: [
              { status: { _eq: 'published' } },
              {
                _or: [
                  { title: { _contains: search } },
                  { description: { _contains: search } },
                  { slug: { _contains: search } },
                  { content: { _contains: search } },
                ],
              },
            ],
          },
          fields: ['id', 'title', 'description', 'slug', 'content', 'status'],
        }),
      ),
    ]);

    return [
      ...pages.map((page) => ({
        id: page.id,
        title: page.title,
        description: page.seo?.meta_description,
        type: 'Page',
        link: `/${page.permalink.replace(/^\/+/, '')}`,
      })),
      ...posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        type: 'Post',
        link: `/blog/${post.slug}`,
      })),
    ];
  } catch {
    throw new Error('Failed to search content');
  }
};


export const fetchAllPosts = async (): Promise<Post[]> => {
  try {
    const posts = (await directus.request(
      readItems('posts', {
        fields: ['id', 'slug', 'status', 'title'],
        filter: { status: { _eq: 'published' } },
      }),
    )) as Post[];

    return posts;
  } catch {
    throw new Error('Failed to fetch all blog posts');
  }
};
export const fetchAllPages = async (): Promise<Page[]> => {
  try {
    const pages = (await directus.request(
      readItems('pages', {
        fields: ['id', 'permalink', 'title'],
        filter: { status: { _neq: 'draft' } },
      }),
    )) as Page[];

    return pages.filter((p) => typeof p.permalink === 'string');
  } catch {
    throw new Error('Failed to fetch all pages');
  }
};

/**
 * Fetches page data by id and version
 */
export const fetchPageDataById = async (id: string, version: string, token?: string): Promise<Page> => {
  if (!id || id.trim() === '') {
    throw new Error('Invalid id: id must be a non-empty string');
  }

  if (!version || version.trim() === '') {
    throw new Error('Invalid version: version must be a non-empty string');
  }

  try {
    const page = (await directus.request(
      withToken(
        token as string,
        readItem('pages', id, {
          version,
          fields: pageFields,
          deep: {
            blocks: {
              _sort: ['sort'],
              _filter: { hide_block: { _neq: true } },
            },
          },
        }),
      ),
    )) as Page;

    return enrichBlogArchiveBlocks(page, token);
  } catch {
    throw new Error('Failed to fetch versioned page');
  }
};

/**
 * Helper function to get page ID by permalink
 */
export const getPageIdByPermalink = async (permalink: string, token?: string, preview?: boolean) => {
  if (!permalink || permalink.trim() === '') {
    throw new Error('Invalid permalink: permalink must be a non-empty string');
  }

  try {
    const pageData = (await directus.request(
      withToken(
        token as string,
        readItems('pages', {
          filter:
            preview && token
              ? { permalink: { _eq: permalink } }
              : { permalink: { _eq: permalink }, status: { _eq: 'published' } },
          limit: 1,
          fields: ['id'],
        }),
      ),
    )) as Pick<Page, 'id'>[];

    return pageData.length > 0 ? pageData[0].id : null;
  } catch {
    return null;
  }
};

/**
 * Helper function to get post ID by slug
 */
export const getPostIdBySlug = async (slug: string, token?: string) => {
  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const postData = (await directus.request(
      withToken(
        token as string,
        readItems('posts', {
          filter: { slug: { _eq: slug } },
          limit: 1,
          fields: ['id'],
        }),
      ),
    )) as Pick<Post, 'id'>[];

    return postData.length > 0 ? postData[0].id : null;
  } catch {
    return null;
  }
};

/**
 * Fetches a single blog post by ID and version
 */
export const fetchPostByIdAndVersion = async (
  id: string,
  version: string,
  slug: string,
  token?: string,
): Promise<{ post: Post; relatedPosts: Post[] }> => {
  if (!id || id.trim() === '') {
    throw new Error('Invalid id: id must be a non-empty string');
  }

  if (!version || version.trim() === '') {
    throw new Error('Invalid version: version must be a non-empty string');
  }

  if (!slug || slug.trim() === '') {
    throw new Error('Invalid slug: slug must be a non-empty string');
  }

  try {
    const postFields = [
      'id',
      'title',
      'content',
      'status',
      'published_at',
      'image',
      'description',
      'slug',
      'seo',
      {
        author: ['id', 'first_name', 'last_name', 'avatar'],
      },
    ] as const;

    const [postData, relatedPosts] = await Promise.all([
      directus.request(
        withToken(
          token as string,
          readItem('posts', id, {
            version,
            fields: postFields,
          }),
        ),
      ),
      fetchRelatedPosts(id),
    ]);

    return { post: postData as Post, relatedPosts };
  } catch {
    throw new Error('Failed to fetch versioned post');
  }
};
