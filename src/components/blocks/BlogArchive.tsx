'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import { decodeHtmlEntities } from '@/lib/html-entities';

// ─── Types mapped từ schema thực tế ───────────────────────────────────────────

interface Category {
  id: string;
  title: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  image?: string | null;
}

interface Post {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  Slug: string; // ⚠️ S hoa — PostgreSQL case-sensitive
  image?: string | null;
  date_published?: string | null;
  is_sticky?: boolean | null;
  sticky_priority?: number | null;
  tags?: Array<{ tags_id?: { name?: string; slug?: string } }> | null;
  categories?: Array<{ categories_id?: Category }> | null;
  author?: Author | null;
}

interface BlogArchiveProps {
  data: {
    id: string;
    headline?: string | null;
    // Config filter từ CMS (không render trực tiếp, đã được fetcher dùng)
    author_filter?: string | null;
    sort_mode?: 'newest' | 'oldest' | null;
    categories?: Array<{ categories_id: Category }>;
    // Data được fetch và đính kèm bởi fetchPageData
    posts: Post[];
    totalCount: number;
    totalPages: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return decodeHtmlEntities(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getExcerpt(post: Post, wordLimit = 25): string {
  const source = stripHtml(post.content) || stripHtml(post.summary);
  if (!source) return '';

  const words = source.split(' ');
  if (words.length <= wordLimit) return source;

  return `${words.slice(0, wordLimit).join(' ')}...`;
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onTagClick }: { post: Post; onTagClick?: (slug: string) => void }) {
  const imageId = typeof post.image === 'string' ? post.image : (post.image as any)?.id;
  const slug = post.Slug;
  const date = formatDate(post.date_published);
  const categoryTitles = (post.categories ?? [])
    .map((entry) => entry?.categories_id?.title)
    .filter((value): value is string => !!value);
  const authorName = post.author?.name;
  const authorImageId = post.author?.image;
  const excerpt = getExcerpt(post);

  return (
    <a
      href={slug ? `/blog/${slug}` : '#'}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-cream shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden rounded-t-2xl bg-soft-nurture">
        {imageId ? (
          <DirectusImage
            uuid={imageId}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-rose-clay"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Sticky badge */}
        {post.is_sticky && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg bg-[#6F8695]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow-sm">
            Nổi bật
          </span>
        )}
        {/* Category badge */}
        {categoryTitles.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {categoryTitles.map((categoryTitle) => (
              <span key={categoryTitle} className="rounded-md bg-soft-nurture/90 px-2 py-0.5 text-[10px] font-semibold text-charcoal backdrop-blur-sm">
                {categoryTitle}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-[260px] flex-1 flex-col gap-3 p-5">
        {date && <p className="text-xs text-gray-400">{date}</p>}

        <h3 className="min-h-[1.75rem] truncate font-heading text-base font-semibold leading-7 text-charcoal transition-colors duration-300 group-hover:text-rose-clay">
          {post.title}
        </h3>

        {excerpt && <p className="min-h-[4.5rem] text-sm leading-relaxed text-gray-500 line-clamp-3">{excerpt}</p>}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <button
                key={tag.tags_id?.slug || tag.tags_id?.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const value = tag.tags_id?.slug;
                  if (value) onTagClick?.(value);
                }}
                className="rounded-lg bg-cream px-2.5 py-0.5 text-xs text-charcoal/50 hover:bg-soft-nurture hover:text-charcoal transition cursor-pointer"
              >
                {tag.tags_id?.name || ''}
              </button>
            ))}
          </div>
        )}

        {/* Author row */}
        {authorName && (
          <div className="mt-auto flex items-center gap-2 border-t border-soft-nurture pt-3">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-soft-nurture">
              {authorImageId ? (
                <DirectusImage
                  uuid={typeof authorImageId === 'string' ? authorImageId : (authorImageId as any)?.id}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-charcoal/70">
                  {authorName.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">{authorName}</span>
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Featured Post (Hero) ────────────────────────────────────────────────────

function FeaturedPost({ post, onTagClick }: { post: Post; onTagClick?: (slug: string) => void }) {
  const imageId = typeof post.image === 'string' ? post.image : (post.image as any)?.id;
  const slug = post.Slug;
  const date = formatDate(post.date_published);
  const categoryTitles = (post.categories ?? [])
    .map((entry) => entry?.categories_id?.title)
    .filter((value): value is string => !!value);
  const authorName = post.author?.name;
  const authorImageId = post.author?.image;
  const excerpt = getExcerpt(post);

  return (
    <a
      href={slug ? `/blog/${slug}` : '#'}
      className="group relative block w-full overflow-hidden rounded-2xl h-[320px] sm:h-[380px] md:h-[480px]"
      style={{ outline: 'none' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-soft-nurture">
        {imageId && (
          <DirectusImage
            uuid={imageId}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>

      {/* Sticky badge */}
      {post.is_sticky && (
        <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-lg bg-[#6F8695]/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow-sm">
          Nổi bật
        </span>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 md:p-8">
        {categoryTitles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoryTitles.map((categoryTitle) => (
              <span key={categoryTitle} className="w-fit rounded-md bg-soft-nurture/90 px-2 py-0.5 text-[10px] font-semibold text-charcoal backdrop-blur-sm">
                {categoryTitle}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h2 className="max-w-2xl font-heading italic text-lg sm:text-xl font-semibold leading-tight text-white md:text-3xl">
            {post.title}
          </h2>
          {/* Arrow icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mt-1 h-6 w-6 shrink-0 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        {excerpt && <p className="max-w-xl text-xs leading-relaxed text-white/80 line-clamp-2 sm:text-sm hidden">{excerpt}</p>}

        <div className="flex flex-wrap items-center gap-6">
          {/* Author */}
          {authorName && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-white/60">Tác giả</p>
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  {authorImageId ? (
                    <DirectusImage
                      uuid={typeof authorImageId === 'string' ? authorImageId : (authorImageId as any)?.id}
                      alt={authorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-rose-clay text-xs font-bold text-charcoal">
                      {authorName.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white">{authorName}</p>
              </div>
            </div>
          )}

          {/* Date */}
          {date && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-white/60">Ngày đăng</p>
              <p className="text-sm font-semibold text-white">{date}</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="hidden sm:flex flex-col gap-1">
              <p className="text-xs font-semibold text-white/60">Từ khoá</p>
              <ul className="flex gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <li key={tag.tags_id?.slug || tag.tags_id?.name}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const value = tag.tags_id?.slug;
                        if (value) onTagClick?.(value);
                      }}
                      className="rounded-lg px-2.5 py-0.5 text-xs font-medium text-white hover:text-rose-clay hover:bg-white/10 transition cursor-pointer"
                    >
                      {tag.tags_id?.name || ''}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (rangeStart > 2) pages.push('ellipsis');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Phân trang">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal/50 transition hover:bg-soft-nurture hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        ←
      </button>

      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${currentPage === page
              ? 'bg-soft-nurture text-charcoal'
              : 'text-charcoal/70 hover:bg-rose-clay/70 hover:text-charcoal'
              }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal/50 transition hover:bg-soft-nurture hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang sau"
      >
        →
      </button>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// Format "2025-07" → "Tháng 7, 2025"
function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `Tháng ${Number(month)}, ${year}`;
}

const BlogArchive = ({ data }: BlogArchiveProps) => {
  const {
    id,
    headline,
    author_filter,
    sort_mode: initialSortMode,
    categories,
    posts: initialPosts,
    totalPages: initialTotalPages,
  } = data;

  const availableCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories
          .map((entry) => entry?.categories_id)
          .filter((value): value is Category => !!value?.id)
        : [],
    [categories],
  );

  const configuredCategoryIds = useMemo(
    () => availableCategories.map((category) => category.id),
    [availableCategories],
  );

  const slugToCategory = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of availableCategories) {
      if (cat.slug) map.set(cat.slug, cat);
    }
    return map;
  }, [availableCategories]);

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>(initialSortMode === 'oldest' ? 'oldest' : 'newest');
  const [activeMonth, setActiveMonth] = useState<string>('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const monthsFetched = useRef(false);

  const activeCategoryId = useMemo(() => {
    if (!activeCategorySlug) return 'all';
    const cat = slugToCategory.get(activeCategorySlug);
    return cat?.id ?? 'all';
  }, [activeCategorySlug, slugToCategory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = window.location.pathname.match(/^\/blog\/danh-muc\/([^/]+)\/?$/);
    setActiveCategorySlug(match?.[1] ?? '');
  }, []);

  // Load available months once on mount only
  useEffect(() => {
    if (monthsFetched.current) return;
    monthsFetched.current = true;

    const params = new URLSearchParams();
    if (author_filter) params.set('author_id', author_filter);
    const ids = configuredCategoryIds;
    if (ids.length > 0) params.set('category_ids', ids.join(','));

    fetch(`/api/blog-archive-months?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setAvailableMonths(data.months ?? []))
      .catch(() => setAvailableMonths([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArchivePosts = useCallback(
    async (page: number, categoryId: string, sort: string, month: string, tag?: string) => {
      const params = new URLSearchParams({ page: String(page), limit: '10', sort });

      if (author_filter) {
        params.set('author_id', author_filter);
      }

      if (categoryId !== 'all') {
        params.set('category_ids', categoryId);
      } else if (configuredCategoryIds.length > 0) {
        params.set('category_ids', configuredCategoryIds.join(','));
      }

      if (month !== 'all') {
        params.set('month', month);
      }

      if (tag) {
        params.set('tag', tag);
      }

      const res = await fetch(`/api/blog-archive-posts?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    },
    [author_filter, configuredCategoryIds],
  );

  const runFetch = useCallback(
    async (page: number, categoryId: string, sort: string, month: string, tag?: string) => {
      setLoading(true);
      setIsTransitioning(true);
      try {
        const result = await fetchArchivePosts(page, categoryId, sort, month, tag);
        setPosts(result.posts ?? []);
        setTotalPages(result.totalPages ?? 1);
      } catch {
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
        window.setTimeout(() => setIsTransitioning(false), 220);
      }
    },
    [fetchArchivePosts],
  );

  // Category + Tag → real navigation (route-based). Sort + Month → state-only.
  const handleCategoryChange = useCallback(
    (slug: string) => {
      if (loading || isTransitioning) return;
      if (slug === 'all') {
        window.location.href = '/blog';
      } else {
        window.location.href = `/blog/danh-muc/${slug}`;
      }
    },
    [loading, isTransitioning],
  );

  const handleSortChange = useCallback(
    (sort: 'newest' | 'oldest') => {
      if (loading || isTransitioning) return;
      setSortMode(sort);
      setCurrentPage(1);
      const catId = activeCategoryId;
      runFetch(1, catId, sort, activeMonth, activeTag);
    },
    [loading, isTransitioning, activeCategoryId, activeMonth, activeTag, runFetch],
  );

  const handleMonthChange = useCallback(
    (month: string) => {
      if (loading || isTransitioning) return;
      setActiveMonth(month);
      setCurrentPage(1);
      runFetch(1, activeCategoryId, sortMode, month, activeTag);
    },
    [loading, isTransitioning, activeCategoryId, sortMode, activeTag, runFetch],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (loading || isTransitioning) return;
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      runFetch(page, activeCategoryId, sortMode, activeMonth, activeTag);
    },
    [loading, isTransitioning, activeCategoryId, activeMonth, activeTag, runFetch, sortMode, totalPages],
  );

  const handleTagClick = useCallback(
    (tagValue: string) => {
      if (loading || isTransitioning || !tagValue) return;
      window.location.href = `/blog/tu-khoa/${tagValue}`;
    },
    [loading, isTransitioning],
  );

  const featuredPost = posts[0] ?? null;
  const visibleGridPosts = posts.slice(1);
  const effectiveTotalPages = totalPages;

  return (
    <section className="bg-cream py-16 md:py-24">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div
          className="mb-10 flex max-w-2xl flex-col gap-2"
          data-directus={setAttr({
            collection: 'block_blog_archive',
            item: id,
            fields: ['headline', 'author_filter', 'categories'],
            mode: 'popover',
          })}
        >
          <span className="font-body text-lg text-rose-clay">Nhật ky & Kien thuc</span>
          <h2 className="font-heading italic text-3xl font-semibold text-charcoal md:text-4xl">
            {headline ?? 'Bai viet & Chia se'}
          </h2>
          <p className="mt-1 text-base text-charcoal/70">
            Kham pha tri thuc huyen hoc, chiem tinh va hanh trinh noi tam.
          </p>
        </div>

        {/* Featured post */}
        {featuredPost && <FeaturedPost post={featuredPost} onTagClick={handleTagClick} />}


        {availableCategories.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              disabled={loading || isTransitioning}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${!activeCategorySlug
                ? 'bg-soft-nurture text-charcoal'
                : 'bg-white text-charcoal/75 hover:bg-soft-nurture hover:text-charcoal'
                }`}
            >
              Tất cả
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                disabled={loading || isTransitioning}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${activeCategorySlug === category.slug
                  ? 'bg-soft-nurture text-charcoal'
                  : 'bg-white text-charcoal/75 hover:bg-soft-nurture hover:text-charcoal'
                  }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        )}

        {/* Sort + Date filter controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Sort mode */}
          <div className="flex items-center gap-1 rounded-xl bg-white px-1 py-1">
            <button
              type="button"
              onClick={() => handleSortChange('newest')}
              disabled={loading || isTransitioning}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sortMode === 'newest' ? 'bg-soft-nurture text-charcoal' : 'text-charcoal/70 hover:bg-rose-clay/70 hover:text-charcoal'}`}
            >
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('oldest')}
              disabled={loading || isTransitioning}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sortMode === 'oldest' ? 'bg-soft-nurture text-charcoal' : 'text-charcoal/70 hover:bg-rose-clay/70 hover:text-charcoal'}`}
            >
              Cũ nhất
            </button>
          </div>

          {/* Date filter - dropdown */}
          {availableMonths.length > 0 && (
            <select
              value={activeMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={loading || isTransitioning}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-charcoal border border-soft-nurture focus:outline-none focus:ring-1 focus:ring-rose-clay disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              aria-label="Lọc theo tháng"
            >
              <option value="all">Tất cả thời gian</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Grid bài viết */}
        <div className="mt-8">
          <div
            className={`transition-all duration-200 ease-out ${isTransitioning ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            {loading ? (
              <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="animate-pulse space-y-3">
                    <div className="h-52 rounded-2xl bg-soft-nurture" />
                    <div className="h-4 w-3/4 rounded bg-soft-nurture" />
                    <div className="h-3 w-full rounded bg-cream" />
                    <div className="h-3 w-5/6 rounded bg-[#FCF5EE]" />
                  </li>
                ))}
              </ul>
            ) : visibleGridPosts.length > 0 ? (
              <ul className="grid auto-rows-fr grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGridPosts.map((post) => (
                  <li key={post.id} className="h-full">
                    <PostCard post={post} onTagClick={handleTagClick} />
                  </li>
                ))}
              </ul>
            ) : featuredPost ? null : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 h-12 w-12 text-rose-clay"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-body text-sm">Chưa có bài viết nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {effectiveTotalPages > 1 && (
          <div className="mt-12">
            <Pagination currentPage={currentPage} totalPages={effectiveTotalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogArchive;
