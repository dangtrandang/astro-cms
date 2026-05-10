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
            <section className="py-20 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="h-56 rounded-xl bg-gray-200" />
                                <div className="h-4 w-3/4 rounded bg-gray-200" />
                                <div className="h-3 w-full rounded bg-gray-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!posts.length) return null;

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="flex items-end justify-between">
                    <h2 className="font-serif text-3xl text-[#850E35] tracking-tight sm:text-4xl">Bài viết mới nhất</h2>
                    <a href="/blog" className="text-sm font-medium text-gray-800 hover:text-[#850E35] transition-colors">
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
                                <div className="relative h-56 overflow-hidden rounded-xl bg-gray-100">
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
                                    {date && <p className="text-xs text-gray-500">{date}</p>}
                                    <h3 className="font-serif text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#850E35] transition-colors">
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
