import type { PageBlock } from '@/types/directus-schema';
import BaseBlock from '@/components/blocks/BaseBlock';

interface PageBuilderProps {
  sections: PageBlock[];
}

const PageBuilder = ({ sections }: PageBuilderProps) => {
  const validBlocks = sections.filter(
    (block): block is PageBlock & { collection: string; item: object } =>
      typeof block.collection === 'string' && !!block.item && typeof block.item === 'object',
  );

  return (
    <div>
      {validBlocks.map((block) => (
        <BaseBlock
          key={block.id}
          block={{
            collection: block.collection,
            item: block.item,
            id: block.id,
          }}
        />
      ))}
    </div>
  );
};

export default PageBuilder;
