import { lazy, Suspense } from 'react';
import type { PageBlock } from '@/types/directus-schema';

const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  block_hero: lazy(() => import('./Hero')),
  block_gallery: lazy(() => import('./Gallery')),
  block_form: lazy(() => import('./ContactForm')),
  block_richtext: lazy(() => import('./RichText')),
  block_quote: lazy(() => import('./Quote')),
  block_who_i_am: lazy(() => import('./WhoIAm')),
};

interface BaseBlockProps {
  block: PageBlock;
}

export default function BaseBlock({ block }: BaseBlockProps) {
  if (!block.collection || !block.item) return null;

  const Component = components[block.collection];

  const itemId =
    typeof block.item === 'object' && block.item !== null && 'id' in block.item ? (block.item.id as string) : undefined;

  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component data={block.item} blockId={block.id} itemId={itemId} />
    </Suspense>
  );
}
