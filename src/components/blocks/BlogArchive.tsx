'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

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
  tags?: string[] | null;
  category?: Category | null;
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
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
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

function PostCard({ post }: { post: Post }) {
  const imageId = typeof post.image === 'string' ? post.image : (post.image as any)?.id;
  const slug = post.Slug;
  const date = formatDate(post.date_published);
  const categoryTitle = post.category?.title;
  const authorName = post.author?.name;
  const authorImageId = post.author?.image;
  const excerpt = getExcerpt(post);

  return (
    <a
      href={slug ? `/blog/${slug}` : '#'}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#F2D1D1] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden rounded-t-xl bg-[#F2D1D1]">
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
              className="h-12 w-12 text-[#C6DCE4]"
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
        {/* Category badge */}
        {categoryTitle && (
          <span className="absolute left-3 top-3 rounded-full bg-[#C6DCE4]/90 px-3 py-1 text-xs font-semibold text-[#850E35] backdrop-blur-sm">
            {categoryTitle}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-[260px] flex-1 flex-col gap-3 p-5">
        {date && <p className="text-xs text-gray-400">{date}</p>}

        <h3 className="min-h-[1.75rem] truncate font-serif text-base font-semibold leading-7 text-gray-800 transition-colors duration-300 group-hover:text-[#850E35]">
          {post.title}
        </h3>

        {excerpt && <p className="min-h-[4.5rem] text-sm leading-relaxed text-gray-500 line-clamp-3">{excerpt}</p>}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#FCF5EE] px-2.5 py-0.5 text-xs text-gray-500 ring-1 ring-[#F2D1D1]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author row */}
        {authorName && (
          <div className="mt-auto flex items-center gap-2 border-t border-[#F2D1D1] pt-3">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-[#F2D1D1]">
              {authorImageId ? (
                <DirectusImage
                  uuid={typeof authorImageId === 'string' ? authorImageId : (authorImageId as any)?.id}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[#850E35]">
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

function FeaturedPost({ post }: { post: Post }) {
  const imageId = typeof post.image === 'string' ? post.image : (post.image as any)?.id;
  const slug = post.Slug;
  const date = formatDate(post.date_published);
  const categoryTitle = post.category?.title;
  const authorName = post.author?.name;
  const authorImageId = post.author?.image;
  const excerpt = getExcerpt(post);

  return (
    <a
      href={slug ? `/blog/${slug}` : '#'}
      className="group relative hidden w-full overflow-hidden rounded-2xl md:block md:h-[480px]"
      style={{ outline: 'none' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-[#F2D1D1]">
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8">
        {categoryTitle && (
          <span className="w-fit rounded-full bg-[#C6DCE4]/90 px-3 py-1 text-xs font-semibold text-[#850E35] backdrop-blur-sm">
            {categoryTitle}
          </span>
        )}

        <div className="flex items-start justify-between gap-4">
          <h2 className="max-w-2xl font-serif text-2xl font-semibold leading-tight text-white md:text-3xl">
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

        {excerpt && <p className="max-w-xl text-sm leading-relaxed text-white/80 line-clamp-2">{excerpt}</p>}

        <div className="flex flex-wrap items-center gap-6">
          {/* Author */}
          {authorName && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-white/60">Tác giả</p>
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/40">
                  {authorImageId ? (
                    <DirectusImage
                      uuid={typeof authorImageId === 'string' ? authorImageId : (authorImageId as any)?.id}
                      alt={authorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[#850E35] text-xs font-bold text-white">
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
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-white/60">Chủ đề</p>
              <ul className="flex gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/40"
                  >
                    {tag}
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
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#F2D1D1] hover:text-[#850E35] disabled:cursor-not-allowed disabled:opacity-40"
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
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${currentPage === page
              ? 'bg-[#850E35] text-white'
              : 'text-gray-600 hover:bg-[#F2D1D1] hover:text-[#850E35]'
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
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-[#F2D1D1] hover:text-[#850E35] disabled:cursor-not-allowed disabled:opacity-40"
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

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sortMode, setSortMode] = useState<'newest' | 'oldest'>(initialSortMode === 'oldest' ? 'oldest' : 'newest');
  const [activeMonth, setActiveMonth] = useState<string>('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const monthsFetched = useRef(false);

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
    async (page: number, categoryId: string, sort: string, month: string) => {
      const params = new URLSearchParams({ page: String(page), limit: '9', sort });

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

      const res = await fetch(`/api/blog-archive-posts?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    },
    [author_filter, configuredCategoryIds],
  );

  const runFetch = useCallback(
    async (page: number, categoryId: string, sort: string, month: string) => {
      setIsTransitioning(true);
      try {
        const result = await fetchArchivePosts(page, categoryId, sort, month);
        setPosts(result.posts ?? []);
        setTotalPages(result.totalPages ?? 1);
      } catch {
        setPosts([]);
        setTotalPages(1);
      } finally {
        window.setTimeout(() => setIsTransitioning(false), 220);
      }
    },
    [fetchArchivePosts],
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      if (loading || isTransitioning || categoryId === activeCategoryId) return;
      setActiveCategoryId(categoryId);
      setCurrentPage(1);
      runFetch(1, categoryId, sortMode, activeMonth);
    },
    [loading, isTransitioning, activeCategoryId, sortMode, activeMonth, runFetch],
  );

  const handleSortChange = useCallback(
    (sort: 'newest' | 'oldest') => {
      if (loading || isTransitioning || sort === sortMode) return;
      setSortMode(sort);
      setCurrentPage(1);
      runFetch(1, activeCategoryId, sort, activeMonth);
    },
    [loading, isTransitioning, sortMode, activeCategoryId, activeMonth, runFetch],
  );

  const handleMonthChange = useCallback(
    (month: string) => {
      if (loading || isTransitioning || month === activeMonth) return;
      setActiveMonth(month);
      setCurrentPage(1);
      runFetch(1, activeCategoryId, sortMode, month);
    },
    [loading, isTransitioning, activeMonth, activeCategoryId, sortMode, runFetch],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || loading || isTransitioning || page === currentPage) return;
      setCurrentPage(page);
      setIsTransitioning(true);
      fetchArchivePosts(page, activeCategoryId, sortMode, activeMonth)
        .then((result) => {
          setPosts(result.posts ?? []);
          setTotalPages(result.totalPages ?? 1);
        })
        .catch(() => {
          setPosts([]);
          setTotalPages(1);
        })
        .finally(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.setTimeout(() => setIsTransitioning(false), 220);
        });
    },
    [activeCategoryId, activeMonth, currentPage, fetchArchivePosts, isTransitioning, loading, sortMode, totalPages],
  );

  const featuredPost = posts[0] ?? null;
  const gridPosts = posts.slice(1);

  return (
    <section className="bg-[#FCF5EE] py-16 md:py-24">
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
          <span className="font-script text-lg text-[#850E35]">Nhật ky & Kien thuc</span>
          <h2 className="font-serif text-3xl font-semibold text-gray-800 md:text-4xl">
            {headline ?? 'Bai viet & Chia se'}
          </h2>
          <p className="mt-1 text-base text-gray-500">
            Kham pha tri thuc huyen hoc, chiem tinh va hanh trinh noi tam.
          </p>
        </div>

        {/* Featured post */}
        {featuredPost && <FeaturedPost post={featuredPost} />}

        {/* Mobile featured (hiển thị như card bình thường) */}
        {featuredPost && (
          <div className="mt-4 md:hidden">
            <PostCard post={featuredPost} />
          </div>
        )}

        {availableCategories.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              disabled={loading || isTransitioning}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${activeCategoryId === 'all'
                ? 'bg-[#850E35] text-white ring-1 ring-[#850E35]'
                : 'bg-white text-[#850E35] ring-1 ring-[#F2D1D1] hover:bg-[#F2D1D1]'
                }`}
            >
              Tat ca
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                disabled={loading || isTransitioning}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${activeCategoryId === category.id
                  ? 'bg-[#850E35] text-white ring-1 ring-[#850E35]'
                  : 'bg-white text-[#850E35] ring-1 ring-[#F2D1D1] hover:bg-[#F2D1D1]'
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
          <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 ring-1 ring-[#F2D1D1]">
            <button
              type="button"
              onClick={() => handleSortChange('newest')}
              disabled={loading || isTransitioning}
              className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sortMode === 'newest' ? 'bg-[#850E35] text-white' : 'text-[#850E35] hover:bg-[#F2D1D1]'}`}
            >
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('oldest')}
              disabled={loading || isTransitioning}
              className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sortMode === 'oldest' ? 'bg-[#850E35] text-white' : 'text-[#850E35] hover:bg-[#F2D1D1]'}`}
            >
              Cũ nhất
            </button>
          </div>

          {/* Date filter */}
          {availableMonths.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleMonthChange('all')}
                disabled={loading || isTransitioning}
                className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${activeMonth === 'all' ? 'bg-[#C6DCE4] text-gray-800 ring-1 ring-[#C6DCE4]' : 'bg-white text-gray-600 ring-1 ring-[#F2D1D1] hover:bg-[#F2D1D1]'}`}
              >
                Tất cả thời gian
              </button>
              {availableMonths.map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthChange(month)}
                  disabled={loading || isTransitioning}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${activeMonth === month ? 'bg-[#C6DCE4] text-gray-800 ring-1 ring-[#C6DCE4]' : 'bg-white text-gray-600 ring-1 ring-[#F2D1D1] hover:bg-[#F2D1D1]'}`}
                >
                  {formatMonthLabel(month)}
                </button>
              ))}
            </div>
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
                    <div className="h-52 rounded-xl bg-[#F2D1D1]" />
                    <div className="h-4 w-3/4 rounded bg-[#F2D1D1]" />
                    <div className="h-3 w-full rounded bg-[#FCF5EE]" />
                    <div className="h-3 w-5/6 rounded bg-[#FCF5EE]" />
                  </li>
                ))}
              </ul>
            ) : gridPosts.length > 0 ? (
              <ul className="grid auto-rows-fr grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <li key={post.id} className="h-full">
                    <PostCard post={post} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 h-12 w-12 text-[#C6DCE4]"
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
                <p className="text-sm">Chua co bai viet nao.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogArchive;
