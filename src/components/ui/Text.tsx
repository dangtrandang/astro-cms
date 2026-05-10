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
      className={cn('prose prose-headings:font-serif prose-headings:text-[#850E35] prose-a:text-[#850E35] hover:prose-a:text-[#C6DCE4] prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content }}
      data-directus={dataDirectus}
    />
  );
};

export default Text;
