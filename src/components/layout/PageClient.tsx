'use client';

import useSWR from 'swr';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import PageBuilder from '@/components/layout/PageBuilder';
import type { PageBlock } from '@/types/directus-schema';

const VisualEditingOverlay = lazy(() => import('@/components/layout/VisualEditingOverlay'));

interface PageClientProps {
  initialSections: PageBlock[];
  permalink: string;
  pageId: string;
}

const fetchBlocks = async (permalink: string, params: URLSearchParams): Promise<PageBlock[]> => {
  const queryString = params.toString();
  const url = `/api/page-blocks?permalink=${encodeURIComponent(permalink)}${queryString ? `&${queryString}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  const data = await res.json();

  return data.blocks;
};

export default function PageClient({ initialSections, permalink, pageId }: PageClientProps) {
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [hasVersioningParams, setHasVersioningParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview') === 'true';
    const hasVersioning = !!params.get('version') || !!params.get('id');

    console.log('[PageClient] preview context', {
      permalink,
      pageId,
      query: window.location.search,
      preview,
      hasVersioning,
    });

    setIsPreviewEnabled(preview);
    setHasVersioningParams(hasVersioning);
  }, [permalink, pageId]);

  const queryString = typeof window !== 'undefined' ? window.location.search : '';
  const swrKey = useMemo(() => `${permalink}-${queryString}`, [permalink, queryString]);

  const { data: sections = initialSections, mutate } = useSWR(
    swrKey,
    () => fetchBlocks(permalink, new URLSearchParams(queryString)),
    {
      fallbackData: initialSections,
      revalidateOnFocus: false,
      revalidateOnMount: isPreviewEnabled || hasVersioningParams,
    },
  );

  const isPreviewContext = isPreviewEnabled || hasVersioningParams;

  return (
    <div className="relative">
      <PageBuilder sections={sections} />
      {isPreviewContext && (
        <Suspense fallback={null}>
          <VisualEditingOverlay pageId={pageId} onMutate={() => mutate()} />
        </Suspense>
      )}
    </div>
  );
}
