'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import DirectusImage from '@/components/shared/DirectusImage';
import BaseText from '@/components/ui/Text';
import { Separator } from '@/components/ui/separator';
import ShareDialog from '@/components/ui/ShareDialog';
import Headline from '@/components/ui/Headline';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';
import type { Post, Team } from '@/types/directus-schema';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import { useVisualEditing } from '@/hooks/useVisualEditing';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface BlogPostClientProps {
  initialPost: Post;
  relatedPosts: Post[];
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
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [hasVersioningParams, setHasVersioningParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsPreviewEnabled(params.get('preview') === 'true');
    setHasVersioningParams(!!params.get('version') || !!params.get('id'));
  }, []);

  const shouldFetchLive = (isVisualEditingEnabled || isPreviewEnabled || hasVersioningParams) && slug;

  const swrKey = shouldFetchLive
    ? `/api/blog-post/${encodeURIComponent(slug!)}?${new URLSearchParams(window.location.search).toString()}&visual-editing=${isVisualEditingEnabled}`
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

  const post = isVisualEditingEnabled ? (swrData?.post ?? initialPost) : initialPost;

  useEffect(() => {
    if (isVisualEditingEnabled) {
      apply({
        onSaved: () => {
          mutate();
        },
      });
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  // --- Table of Contents: Scroll Spy ---
  const [activeId, setActiveId] = useState<string>('');
  const tocNavRef = useRef<HTMLElement>(null);

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

    // Map id → element để tra nhanh
    const headingMap = new Map<string, HTMLElement>();
    headingElements.forEach((el) => headingMap.set(el.id, el));

    const observer = new IntersectionObserver(
      (entries) => {
        // Tìm heading đang intersect có boundingClientRect.top nhỏ nhất
        // (gần đỉnh viewport nhất, tức là heading mà người dùng đang đọc)
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;

        let closest: IntersectionObserverEntry | null = null;
        let minTop = Infinity;
        for (const entry of intersecting) {
          const top = entry.boundingClientRect.top;
          if (top < minTop) {
            minTop = top;
            closest = entry;
          }
        }
        if (closest) {
          setActiveId(closest.target.id);
        }
      },
      {
        // Chỉ kích hoạt khi heading chạm vùng dưới header sticky (96px)
        rootMargin: '-96px 0px -60% 0px',
        threshold: 0,
      },
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [tocItems, enrichedContent]);

  // Render content: ưu tiên enrichedContent (có ID headings), fallback post.content
  const displayContent = enrichedContent || post.content || '';

  if (!post) return null;

  return (
    <>
      <Container className="py-12">
        {post.image && (
          <div className="mb-8">
            <div
              className="relative w-full h-[400px] overflow-hidden rounded-lg"
              data-directus={setAttr({
                collection: 'posts',
                item: post.id,
                fields: ['image', 'meta_header_image'],
                mode: 'modal',
              })}
            >
              <DirectusImage
                uuid={post.image as string}
                alt={post.title || 'post header image'}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        )}

        <Headline
          as="h1"
          headline={post.title}
          className="!text-[#850E35] font-serif text-4xl lg:text-5xl mb-4"
          data-directus={setAttr({
            collection: 'posts',
            item: post.id,
            fields: ['title', 'slug'],
            mode: 'popover',
          })}
        />

        {/* Meta Data – TẤT CẢ dưới tiêu đề: Danh mục + Từ khoá + Ngày đăng + Tác giả */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-6">
          {categoryName && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Danh mục:</span>
              <a
                href={categorySlug ? `/blog?category=${categorySlug}` : '#'}
                className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase transition-colors duration-200"
                style={{
                  backgroundColor: categoryColor ? `${categoryColor}20` : '#F2D1D1',
                  color: categoryColor || '#850E35',
                  border: `1px solid ${categoryColor || '#850E35'}40`,
                }}
              >
                {categoryName}
              </a>
            </span>
          )}
          {tags && tags.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Từ khoá:</span>
              <span className="inline-flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <a
                    key={tag.slug}
                    href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                    className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200 hover:bg-[#F2D1D1] hover:text-[#850E35] hover:border-[#850E35]/30 transition-colors duration-200"
                  >
                    {tag.name}
                  </a>
                ))}
              </span>
            </span>
          )}
          {datePublished && (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400 font-medium">Ngày đăng:</span>
              <time dateTime={post.date_published ?? undefined}>
                {datePublished}
              </time>
            </span>
          )}
          {authorName && (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400 font-medium">Tác giả:</span>
              <span>{authorName}</span>
            </span>
          )}
        </div>

        {/* Full-width Separator – kéo dài hết container, chia tách tiêu đề + grid */}
        <hr className="border-0 border-t border-[#F2D1D1] mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12 lg:items-start">
          <main className="text-left">
            <BaseText
              content={displayContent}
              data-directus={setAttr({
                collection: 'posts',
                item: post.id,
                fields: ['content', 'meta_header_content'],
                mode: 'drawer',
              })}
            />
          </main>

          <aside className="p-6 rounded-xl max-w-[496px] bg-[#F2D1D1]/40 border border-[#F2D1D1] lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            {/* Author + Title – không sticky, trên cùng */}
            {author && (
              <div
                className="flex items-center space-x-4 mb-4"
                data-directus={setAttr({
                  collection: 'posts',
                  item: post.id,
                  fields: ['author'],
                  mode: 'popover',
                })}
              >
                {author.image && (
                  <DirectusImage
                    uuid={typeof author.image === 'string' ? author.image : author.image.id}
                    alt={authorName || 'author avatar'}
                    className="rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                )}
                <div>
                  {authorName && <p className="font-bold text-gray-800">{authorName}</p>}
                  {post.summary && (
                    <p
                      className="text-sm text-gray-500 mt-0.5"
                      data-directus={setAttr({
                        collection: 'posts',
                        item: post.id,
                        fields: ['summary'],
                        mode: 'popover',
                      })}
                    >
                      {post.summary}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ToC + Share + Related Posts */}
            <div className="space-y-5">
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

              <Separator className="border-[#F2D1D1]" />

              {/* Share */}
              <div className="flex justify-start">
                <ShareDialog postUrl={postUrl} postTitle={post.title} />
              </div>

              <Separator className="border-[#F2D1D1]" />

              {/* Related Posts */}
              <div>
                <h3 className="font-bold font-serif text-xl text-[#850E35] mb-3">Bài viết liên quan</h3>
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
                            className="font-serif text-base font-normal text-gray-800 transition-colors hover:text-[#850E35] line-clamp-2"
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
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
