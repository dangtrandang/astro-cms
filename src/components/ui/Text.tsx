import React from 'react';
import { cn } from '@/lib/utils';

export interface TextProps {
  content: string;
  className?: string;
  'data-directus'?: string;
}

const Text = ({ content, className, 'data-directus': dataDirectus }: TextProps) => {
  return (
    <div
      className={cn('prose max-w-none text-justify prose-headings:font-heading prose-headings:italic prose-headings:text-charcoal prose-a:text-charcoal underline-offset-4 hover:prose-a:text-rose-clay prose-p:text-charcoal/80 prose-strong:text-charcoal prose-li:text-charcoal/80', className)}
      dangerouslySetInnerHTML={{ __html: content }}
      data-directus={dataDirectus}
    />
  );
};

export default Text;
