'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import DirectusImage from '@/components/shared/DirectusImage';
import BaseText from '@/components/ui/Text';
import { Separator } from '@/components/ui/separator';
import ShareDialog from '@/components/ui/ShareDialog';
import Headline from '@/components/ui/Headline';
import { cn } from '@/lib/utils';
import type { Post, Team } from '@/types/directus-schema';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface BlogPostClientProps {
  initialPost: Post;
  relatedPosts: Post[];
  previousPost?: Pick<Post, 'id' | 'title' | 'Slug'> | null;
  nextPost?: Pick<Post, 'id' | 'title' | 'Slug'> | null;
  author?: Team | null;
  authorName: string;
  postUrl: string;
  slug?: string;
  tocItems?: TocItem[];
  enrichedContent?: string;
  categoryName?: string | null;
  categoryColor?: string | null;
  categorySlug?: string | null;
  datePublished?: string | null;
  tags?: Array<{ name: string; slug: string }> | null;
}

export default function BlogPostClient({
  initialPost,
  relatedPosts,
  previousPost,
  nextPost,
  author,
  authorName,
  postUrl,
  slug,
  tocItems,
  enrichedContent,
  categoryName,
  categoryColor,
  categorySlug,
  datePublished,
  tags,
}: BlogPostClientProps) {
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [hasVersioningParams, setHasVersioningParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPreviewEnabled(params.get('preview') === 'true');
    setHasVersioningParams(!!params.get('version') || !!params.get('id'));
  }, []);

  const shouldFetchLive = (isPreviewEnabled || hasVersioningParams) && slug;

  const swrKey = shouldFetchLive
    ? `/api/blog-post/${encodeURIComponent(slug!)}?${new URLSearchParams(window.location.search).toString()}`
    : null;

  const { data: swrData, mutate } = useSWR(
    swrKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch post');
      }
      const data = await res.json();

      return data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const post = shouldFetchLive ? (swrData?.post ?? initialPost) : initialPost;

  // --- Table of Contents: Scroll Spy ---
  const [activeId, setActiveId] = useState<string>('');
  const tocNavRef = useRef<HTMLElement>(null);
  const visibleHeadingsRef = useRef<string[]>([]);

  const handleTocClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Cập nhật URL hash không reload trang
      window.history.replaceState(null, '', `#${id}`);
    }
  }, []);

  // Scroll Spy: IntersectionObserver theo dõi heading trong viewport
  useEffect(() => {
    if (!tocItems || tocItems.length === 0) return;

    const headingElements = tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    visibleHeadingsRef.current = [];

    const getClosestHeadingId = () => {
      const sortedByTop = [...headingElements].sort(
        (a, b) => Math.abs(a.getBoundingClientRect().top - 100) - Math.abs(b.getBoundingClientRect().top - 100),
      );

      return sortedByTop[0]?.id ?? activeId;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const headingId = (entry.target as HTMLElement).id;

          if (entry.isIntersecting) {
            if (!visibleHeadingsRef.current.includes(headingId)) {
              visibleHeadingsRef.current.push(headingId);
            }
          } else {
            visibleHeadingsRef.current = visibleHeadingsRef.current.filter((id) => id !== headingId);
          }
        }

        const orderedVisibleIds = tocItems
          .map((item) => item.id)
          .filter((id) => visibleHeadingsRef.current.includes(id));

        if (orderedVisibleIds.length > 0) {
          setActiveId(orderedVisibleIds[0]);
          return;
        }

        const fallbackId = getClosestHeadingId();
        if (fallbackId) {
          setActiveId(fallbackId);
        }
      },
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0,
      },
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      visibleHeadingsRef.current = [];
    };
  }, [tocItems, enrichedContent, activeId]);

  // Render content: ưu tiên enrichedContent (có ID headings), fallback post.content
  const displayContent = enrichedContent || post.content || '';

  if (!post) return null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 overflow-hidden rounded-2xl">
          <div
            className="group relative h-[320px] w-full overflow-hidden rounded-2xl sm:h-[380px] md:h-[480px]"
          >
            <div className="absolute inset-0 bg-[#F2D1D1]">
              {post.image && (
                <DirectusImage
                  uuid={post.image as string}
                  alt={post.title || 'post header image'}
                  className="object-cover"
                  fill
                  sizes="100vw"
                />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:gap-4 sm:p-6 md:p-8">
              {categoryName && (
                <a
                  href={categorySlug ? `/blog?category=${categorySlug}` : '#'}
                  className="w-fit rounded-full bg-[#C6DCE4]/90 px-2.5 py-0.5 text-[11px] font-semibold text-[#850E35] backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs"
                >
                  {categoryName}
                </a>
              )}

              <div className="flex items-start justify-between gap-4">
                <Headline
                  as="h1"
                  headline={post.title}
                  className="max-w-[80rem] !font-serif text-[1.7rem] font-semibold leading-tight !text-[#f5dcda] sm:text-4xl md:text-5xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {authorName && (
                  <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
                    <p className="hidden text-[11px] font-semibold text-white/60 sm:block sm:text-xs">Tác giả</p>
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/40">
                        {author?.image ? (
                          <DirectusImage
                            uuid={typeof author.image === 'string' ? author.image : (author.image as any)?.id}
                            alt={authorName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-[#850E35] text-[11px] font-bold text-white sm:text-xs">
                            {authorName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white sm:text-sm">{authorName}</p>
                    </div>
                  </div>
                )}

                {datePublished && (
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <p className="text-[10px] font-semibold text-white/60 sm:text-xs">Ngày đăng</p>
                    <time dateTime={post.date_published ?? undefined} className="text-xs font-semibold text-white sm:text-sm">
                      {datePublished}
                    </time>
                  </div>
                )}

                {tags && tags.length > 0 && (
                  <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
                    <p className="text-[10px] font-semibold text-white/60 sm:text-xs">Từ khoá</p>
                    <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                      {tags.slice(0, 3).map((tag) => (
                        <li key={tag.slug}>
                          <a
                            href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white ring-1 ring-white/40 transition-colors duration-200 hover:bg-white/10 sm:px-2.5 sm:text-xs"
                          >
                            {tag.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 h-[2px] w-full bg-[#f8e7e3]" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12 lg:items-start">
          <main className="text-justify">
            {/* ToC in content area */}
            {tocItems && tocItems.length > 0 && (
              <nav aria-label="Mục lục bài viết" className="mb-10 p-5 rounded-xl bg-[#F2D1D1]/40">
                <h3 className="font-serif text-lg font-bold text-[#850E35] mb-3">
                  Nội dung bài viết
                </h3>
                <ul className="space-y-0.5">
                  {tocItems.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => handleTocClick(e, item.id)}
                          className={cn(
                            'block py-1.5 text-sm transition-colors duration-200 border-l-2',
                            isActive
                              ? 'text-[#850E35] font-medium border-[#850E35]'
                              : 'text-gray-600 hover:text-[#850E35] border-transparent',
                          )}
                        >
                          {item.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            <BaseText
              content={displayContent}
            />

            {(previousPost || nextPost) && (
              <div className="mt-10 grid grid-cols-2 gap-3 border-t border-[#f8e7e3] pt-6 sm:gap-6">
                {previousPost ? (
                  <a href={`/blog/${previousPost.Slug}`} className="group block">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e7e3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#850E35] transition-colors group-hover:bg-[#F2D1D1]">
                      <span aria-hidden="true">←</span>
                      <span>Bài trước</span>
                    </span>
                    <span className="mt-2 hidden font-serif text-sm text-gray-500 transition-colors group-hover:text-[#850E35] sm:block">
                      {previousPost.title.length > 35 ? `${previousPost.title.slice(0, 35)}...` : previousPost.title}
                    </span>
                  </a>
                ) : (
                  <div />
                )}

                {nextPost ? (
                  <a href={`/blog/${nextPost.Slug}`} className="group block text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e7e3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#850E35] transition-colors group-hover:bg-[#F2D1D1]">
                      <span>Bài sau</span>
                      <span aria-hidden="true">→</span>
                    </span>
                    <span className="mt-2 hidden font-serif text-sm text-gray-500 transition-colors group-hover:text-[#850E35] sm:block">
                      {nextPost.title.length > 35 ? `${nextPost.title.slice(0, 35)}...` : nextPost.title}
                    </span>
                  </a>
                ) : (
                  <div />
                )}
              </div>
            )}
          </main>

          <aside className="p-6 rounded-xl max-w-[496px] bg-[#F2D1D1]/40 lg:sticky lg:top-24">
            {/* Author box */}
            {author && (
              <div
                className="mb-[4.2rem] rounded-xl border border-[#F2D1D1] bg-[#f8e7e3] p-5"
              >
                <div className="flex items-center gap-4">
                  {author.image ? (
                    <DirectusImage
                      uuid={typeof author.image === 'string' ? author.image : author.image.id}
                      alt={authorName || 'author avatar'}
                      className="h-16 w-16 rounded-full object-cover shrink-0"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#850E35] text-lg font-bold text-white">
                      {authorName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    {authorName && <p className="font-serif text-xl font-semibold text-[#850E35]">{authorName}</p>}
                  </div>
                </div>

                {author.bio && (
                  <div
                    className="mt-4 text-sm text-gray-700 [&_p]:mt-0 [&_p]:mb-3 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: author.bio }}
                  />
                )}
              </div>
            )}

            {/* ToC + Related Posts */}
            <div className="space-y-8">
              {/* Table of Contents */}
              {tocItems && tocItems.length > 0 && (
                <nav ref={tocNavRef} aria-label="Mục lục bài viết">
                  <h3 className="font-serif text-lg font-bold text-[#850E35] mb-3">
                    Nội dung bài viết
                  </h3>
                  <ul className="space-y-0.5">
                    {tocItems.map((item) => {
                      const isActive = activeId === item.id;
                      return (
                        <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => handleTocClick(e, item.id)}
                            className={cn(
                              'block py-1.5 text-sm transition-colors duration-200 border-l-2',
                              isActive
                                ? 'text-[#850E35] font-medium border-[#850E35]'
                                : 'text-gray-600 hover:text-[#850E35] border-transparent',
                            )}
                          >
                            {item.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              {/* Related Posts */}
              <div>
                <h3 className="font-serif text-lg font-bold text-[#850E35] mb-3">Bài viết liên quan</h3>
                <div className="space-y-3">
                  {relatedPosts.map((relatedPost) => {
                    const postLink = `/blog/${(relatedPost as any).Slug || (relatedPost as any).slug}`;
                    return (
                      <div key={relatedPost.id} className="flex items-center space-x-3 group">
                        {relatedPost.image && (
                          <a href={postLink} className="relative shrink-0 w-20 h-20 overflow-hidden rounded-lg">
                            <DirectusImage
                              uuid={typeof relatedPost.image === 'string' ? relatedPost.image : (relatedPost.image as any)?.id}
                              alt={relatedPost.title || 'related post'}
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              fill
                              sizes="(max-width: 768px) 100px, (max-width: 1024px) 120px, 120px"
                            />
                          </a>
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={postLink}
                            className="text-base font-normal text-gray-800 transition-colors hover:text-[#850E35] line-clamp-2 [font-family:inherit]"
                            title={relatedPost.title ?? undefined}
                          >
                            {relatedPost.title && relatedPost.title.length > 55
                              ? `${relatedPost.title.slice(0, 55)}...`
                              : relatedPost.title}
                          </a>
                          <a
                            href={postLink}
                            className="inline-block mt-0.5 text-xs text-gray-400 hover:text-[#850E35] transition-colors"
                          >
                            Xem chi tiết →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {tags && tags.length > 0 && (
                <div>
                  <h3 className="mb-3 font-serif text-lg font-bold text-[#850E35]">Từ khoá</h3>
                  <ul className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li key={tag.slug}>
                        <a
                          href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                          className="inline-flex rounded-full bg-[#f8e7e3] px-3 py-1 text-xs font-medium text-[#850E35] transition-colors hover:bg-[#F2D1D1]"
                        >
                          {tag.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
