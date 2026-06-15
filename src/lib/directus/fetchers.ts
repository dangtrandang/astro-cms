import type { DirectusUser, Page, Post, Schema } from '@/types/directus-schema';
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
            'video',
            'image_position',
            'variant',
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
          block_form: [
            'id',
            'title',
            'headline',
            {
              form: [
                'id',
                'title',
                'on_success',
                'submit_label',
                'success_message',
                'schema',
              ],
            },
            {
              image: [
                {
                  directus_files_id: ['id', 'title', 'description', 'width', 'height'],
                },
              ],
            },
          ] as any,
          block_gallery: [
            'id',
            'title',
            'headline',
            'variant',
            'background_color',
            { background_image: ['id', 'title', 'description'] },
            { background_video: ['id', 'title', 'description'] },
            {
              gallery_items: ['id', 'sort', 'size', { directus_files_id: ['id', 'title', 'description', 'width', 'height'] }],
            },
          ] as any,
          block_account: [
            'id',
            'title',
            'default_tab',
            'enabled_tabs',
            'tab_labels',
            'allow_avatar_edit',
            'allow_cover_edit',
            'show_logout_button',
            'support_content',
          ] as any,
          block_richtext: ['id', 'title', 'headline', 'content', 'alignment'] as any,
          block_quote: ['id', 'title', 'subtitle', 'content'] as any,
          block_who_i_am: [
            'id',
            'title',
            'eyebrow',
            'headline',
            'content',
            { portrait_image: ['id'] },
            'center_badge',
            'right_items',
            'social_links',
            'theme_variant',
          ] as any,
        },
      },
    ],
  },
] as const;

/**
 * Fetches page data by permalink, including all nested blocks.
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

    return pageData[0];
  } catch {
    throw new Error(`Failed to fetch page with permalink "${permalink}"`);
  }
};

/**
 * Singleton page fetchers — each page has its own Directus singleton collection.
 */

export const fetchPageLienHe = async () => {
  try {
    const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
    const client = createAuthClient(serverToken);
    const page = await client.request(readSingleton('page_lien_he', {
      fields: ['id', 'seo'],
    }));
    const blockFormResult = await client.request(readItems('block_form', {
      filter: { form: { key: { _eq: 'contact' } } },
      fields: ['id', 'title', 'headline',
        { form: ['id', 'title', 'on_success', 'submit_label', 'success_message', 'schema'] },
        { image: [{ directus_files_id: ['id'] }] },
      ],
      limit: 1,
    }));
    const block = (blockFormResult as any[])?.[0] ?? null;
    return {
      id: (page as any)?.id ?? '',
      title: block?.title ?? null,
      form_headline: block?.headline ?? null,
      contact_form: block?.form ?? null,
      image: block?.image ?? null,
      seo: (page as any)?.seo ?? null,
    };
  } catch (err) {
    console.error('fetchPageLienHe error:', err);
    return { id: '', title: null, form_headline: null, contact_form: null, image: null, seo: null };
  }
};

export const fetchPageGioiThieu = async () => {
  try {
    return await directus.request(readSingleton('page_gioi_thieu', {
      fields: ['id', 'who_i_am_eyebrow', 'who_i_am_headline', 'who_i_am_content', 'who_i_am_portrait_image', 'who_i_am_center_badge', 'who_i_am_right_items', 'who_i_am_social_links', 'who_i_am_theme_variant', 'gallery_headline', 'gallery_variant', 'gallery_background_color', 'gallery_background_image', { gallery_images: ['directus_files_id'] }, 'seo'],
    })) as any;
  } catch { return { id: '', who_i_am_headline: null, seo: null }; }
};

export const fetchPageChinhSachBaoMat = async () => {
  try {
    return await directus.request(readSingleton('page_chinh_sach_bao_mat', {
      fields: ['id', 'body_headline', 'body_content', 'seo'],
    })) as any;
  } catch { return { id: '', body_headline: null, body_content: null, seo: null }; }
};

export const fetchPageDieuKhoanDichVu = async () => {
  try {
    return await directus.request(readSingleton('page_dieu_khoan_dich_vu', {
      fields: ['id', 'body_headline', 'body_content', 'seo'],
    })) as any;
  } catch { return { id: '', body_headline: null, body_content: null, seo: null }; }
};

export const fetchPageWorkWithMe = async () => {
  try {
    return await directus.request(readSingleton('page_work_with_me', {
      fields: ['id', 'hero_headline', 'hero_content', 'hero_image', 'hero_variant', { hero_button_group: [{ buttons: ['id', 'label', 'variant', 'color', 'type', 'external_url', { page: ['permalink'] }] }] }, 'seo'],
    })) as any;
  } catch { return { id: '', hero_headline: null, hero_content: null, seo: null }; }
};

/**
 * Fetches global site data, header navigation, and footer navigation.
 */
export const fetchSiteData = async () => {
  if (!import.meta.env.PUBLIC_DIRECTUS_URL?.trim()) {
    throw new Error('Missing PUBLIC_DIRECTUS_URL. Copy .env.example to .env and set your Directus URL.');
  }

  try {
    const [globals, headerNavigation, footerItems] = await Promise.all([
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
        readItems('navigation_items', {
          fields: ['id', 'title', 'url', 'sort', 'parent', { page: ['permalink'] }],
          filter: { navigation: { _eq: 'footer' } },
          sort: ['sort'],
          limit: -1,
        }),
      ),
    ]);

    // Build parent-child tree for footer navigation
    const footerNavItems = footerItems as any[];
    const getParentId = (item: any) => (item.parent === null ? null : typeof item.parent === 'string' ? item.parent : item.parent?.id ?? null);
    const parents = footerNavItems.filter((item) => getParentId(item) === null);
    const children = footerNavItems.filter((item) => getParentId(item) !== null);

    const footerNavigation = {
      id: 'footer',
      title: 'Footer Navigation',
      items: parents.map((parent) => ({
        ...parent,
        children: children
          .filter((child) => getParentId(child) === parent.id)
          .map((child) => ({
            id: child.id,
            title: child.title,
            url: child.url,
            page: child.page,
          })),
      })),
    };

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
          { tags: [{ tags_id: ['name', 'slug'] }] },
          { category: ['id', 'title', 'color', 'slug'] },
          { author: ['id', 'name', 'image', 'bio'] },
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
        fields: ['id', 'title', { image: ['id'] }, 'Slug', 'seo'] as any[],
        limit: 3,
      }),
    )) as unknown as Post[];

    return relatedPosts;
  } catch {
    throw new Error('Failed to fetch related posts');
  }
};

export type AdjacentPost = Pick<Post, 'id' | 'title' | 'Slug'>;

export interface AdjacentPostLinks {
  previousPost: AdjacentPost | null;
  nextPost: AdjacentPost | null;
}

/**
 * Fetches previous and next published posts by date.
 */
export const fetchAdjacentPosts = async (post: Post): Promise<AdjacentPostLinks> => {
  if (!post.date_published) {
    return { previousPost: null, nextPost: null };
  }

  try {
    const fields = ['id', 'title', 'Slug'] as any[];
    const publishedAt = post.date_published;

    const [previousPosts, nextPosts] = await Promise.all([
      directus.request(
        readItems('posts', {
          filter: {
            status: { _eq: 'published' },
            id: { _neq: post.id },
            date_published: { _lt: publishedAt },
          } as any,
          sort: ['-date_published'] as any[],
          limit: 1,
          fields,
        }),
      ),
      directus.request(
        readItems('posts', {
          filter: {
            status: { _eq: 'published' },
            id: { _neq: post.id },
            date_published: { _gt: publishedAt },
          } as any,
          sort: ['date_published'] as any[],
          limit: 1,
          fields,
        }),
      ),
    ]);

    const previousPost = ((previousPosts as unknown as AdjacentPost[])[0] ?? null);
    const nextPost = ((nextPosts as unknown as AdjacentPost[])[0] ?? null);

    return {
      previousPost,
      nextPost,
    };
  } catch {
    throw new Error('Failed to fetch adjacent posts');
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

    return page;
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
      'date_published',
      'image',
      'summary',
      'Slug',
      'seo',
      { tags: [{ tags_id: ['name', 'slug'] }] },
      { category: ['id', 'title', 'color', 'slug'] },
      { author: ['id', 'name', 'image', 'bio'] },
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

/**
 * Fetch homepage data from the homepage singleton collection.
 * Used by index.astro (hardcoded route, no Block Builder).
 * 4 sections: Hero, WhoIAm, Gallery (accordion), Quote.
 */
export type HomepageData = {
  hero_headline?: string | null;
  hero_content?: string | null;
  hero_image?: string | { id: string } | null;
  hero_video?: string | { id: string } | null;
  hero_variant?: string | null;
  who_i_am_eyebrow?: string | null;
  who_i_am_headline?: string | null;
  who_i_am_content?: string | null;
  who_i_am_portrait_image?: string | { id: string } | null;
  who_i_am_center_badge?: string | null;
  who_i_am_right_items?: any[] | null;
  who_i_am_social_links?: any[] | null;
  who_i_am_theme_variant?: string | null;
  gallery_headline?: string | null;
  gallery_variant?: string | null;
  gallery_background_color?: string | null;
  gallery_background_image?: string | { id: string } | null;
  gallery_images?: any[] | null;
  quote_title?: string | null;
  quote_subtitle?: string | null;
  quote_content?: string | null;
  seo?: { title?: string | null; meta_description?: string | null; og_image?: string | null } | string | null;
  hero_button_group?: { id: string; buttons?: any[] } | string | null;
};

const homepageFields = [
  'hero_headline', 'hero_content', 'hero_image', 'hero_video', 'hero_variant',
  { hero_button_group: [{ buttons: ['id', 'label', 'variant', 'color', 'type', 'external_url', { page: ['permalink'] }] }] },
  'who_i_am_eyebrow', 'who_i_am_headline', 'who_i_am_content',
  'who_i_am_portrait_image', 'who_i_am_center_badge',
  'who_i_am_right_items', 'who_i_am_social_links', 'who_i_am_theme_variant',
  'gallery_headline', 'gallery_variant', 'gallery_background_color',
  'gallery_background_image',
  { gallery_images: ['id', 'sort', { directus_files_id: ['id', 'title', 'description', 'width', 'height'] }] },
  'quote_title', 'quote_subtitle', 'quote_content',
  { seo: ['title', 'meta_description', 'og_image'] },
] as any[];

export const fetchHomepageData = async (): Promise<HomepageData> => {
  const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
  if (!serverToken) {
    console.warn('fetchHomepageData: DIRECTUS_SERVER_TOKEN not set, using unauthenticated client');
  }

  try {
    const client = createAuthClient(serverToken);
    const data = await client.request(
      readSingleton('homepage', {
        fields: homepageFields,
      }),
    ) as HomepageData;

    return data ?? {};
  } catch (error) {
    console.error('fetchHomepageData error:', error);
    return {};
  }
};

export const BLOG_ARCHIVE_PAGE_SIZE = 10;

const blogArchivePostFields = [
  'id',
  'title',
  'summary',
  'content',
  'Slug',
  'image',
  'date_published',
  { tags: [{ tags_id: ['name', 'slug'] }] },
  { categories: [{ categories_id: ['id', 'title', 'slug'] }] },
  { author: ['id', 'name', 'image'] },
] as any[];

export const fetchBlogArchiveData = async (
  page = 1,
  authorFilter?: string,
  categoryFilter?: string[],
  sortMode?: 'newest' | 'oldest',
): Promise<{ posts: any[]; totalCount: number; totalPages: number }> => {
  const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
  const client = createAuthClient(serverToken);

  const andConditions: any[] = [{ status: { _eq: 'published' } }];

  if (authorFilter) {
    andConditions.push({ author: { _eq: authorFilter } });
  }

  if (categoryFilter && categoryFilter.length > 0) {
    andConditions.push({ categories: { categories_id: { id: { _in: categoryFilter } } } });
  }

  const filter = andConditions.length > 1 ? { _and: andConditions } : andConditions[0];
  const sortDir = sortMode === 'oldest' ? 'date_published' : '-date_published';

  const [posts, countResponse] = await Promise.all([
    client.request(
      sdkReadItems('posts', {
        filter: filter as any,
        sort: [sortDir] as any[],
        limit: BLOG_ARCHIVE_PAGE_SIZE,
        page,
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
    posts: posts as any[],
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / BLOG_ARCHIVE_PAGE_SIZE)),
  };
};

export const fetchCategories = async () => {
  try {
    const serverToken = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
    const client = createAuthClient(serverToken);
    const categories = await client.request(
      readItems('categories', {
        fields: ['id', 'title', 'slug'],
        sort: ['sort'],
        limit: -1,
      }),
    );
    return (categories as any[]) ?? [];
  } catch {
    console.error('fetchCategories error');
    return [];
  }
};
