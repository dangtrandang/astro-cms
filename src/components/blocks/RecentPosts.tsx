'use client';

import { useEffect, useState } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import type { Post } from '@/types/directus-schema';

const RecentPosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/recent-posts');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setPosts(data.posts || []);
            } catch {
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <section className="bg-cream px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="h-56 rounded-2xl bg-soft-nurture" />
                                <div className="h-4 w-3/4 rounded bg-soft-nurture" />
                                <div className="h-3 w-full rounded bg-cream" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!posts.length) return null;

    return (
        <section className="bg-cream px-6 py-20">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="flex items-end justify-between">
                    <h2 className="font-heading text-3xl font-semibold italic tracking-tight text-charcoal sm:text-4xl">Bài viết mới nhất</h2>
                    <a href="/blog" className="text-sm font-medium text-charcoal transition-colors hover:text-rose-clay">
                        Xem tất cả →
                    </a>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => {
                        const imageId = typeof post.image === 'string' ? post.image : post.image?.id;
                        const slug = (post as any).Slug as string | undefined;
                        const date = post.date_created
                            ? new Date(post.date_created).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })
                            : null;
                        const card = (
                            <div key={post.id} className="group block space-y-4">
                                <div className="relative h-56 overflow-hidden rounded-2xl bg-soft-nurture">
                                    {imageId && (
                                        <DirectusImage
                                            uuid={imageId}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {date && <p className="text-xs text-charcoal/55">{date}</p>}
                                    <h3 className="line-clamp-2 font-heading text-lg font-semibold italic text-charcoal transition-colors group-hover:text-rose-clay">
                                        {post.title}
                                    </h3>
                                </div>
                            </div>
                        );
                        return slug ? (
                            <a key={post.id} href={`/blog/${slug}`} className="block">
                                {card}
                            </a>
                        ) : (
                            <div key={post.id}>{card}</div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default RecentPosts;
