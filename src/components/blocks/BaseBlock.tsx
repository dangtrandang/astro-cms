import React from 'react';
import Form from './Form';
import Gallery from './Gallery';
import Posts from './Posts';
import Hero from './Hero';
import RichText from './RichText';
import Pricing from './Pricing';
import Cta from './Cta';
import Columns from './Columns';
import Faqs from './Faqs';
import Html from './Html';
import LogoCloud from './LogoCloud';
import Quote from './Quote';
import Steps from './Steps';
import Team from './Team';
import Testimonials from './Testimonials';
import Video from './Video';
import Divider from './Divider';
import BlogArchive from './BlogArchive';
import type { PageBlock } from '@/types/directus-schema';

interface BaseBlockProps {
  block: PageBlock;
}

export default function BaseBlock({ block }: BaseBlockProps) {
  if (!block.collection || !block.item) return null;

  const components: Record<string, React.ElementType> = {
    block_hero: Hero,
    block_gallery: Gallery,
    block_posts: Posts,
    block_blog_archive: BlogArchive,
    block_form: Form,
    block_richtext: RichText,
    block_pricing: Pricing,
    block_cta: Cta,
    block_columns: Columns,
    block_faqs: Faqs,
    block_html: Html,
    block_logocloud: LogoCloud,
    block_quote: Quote,
    block_steps: Steps,
    block_team: Team,
    block_testimonials: Testimonials,
    block_video: Video,
    block_divider: Divider,
  };

  const Component = components[block.collection];

  const itemId =
    typeof block.item === 'object' && block.item !== null && 'id' in block.item ? (block.item.id as string) : undefined;

  return Component ? <Component data={block.item} blockId={block.id} itemId={itemId} /> : null;
}
