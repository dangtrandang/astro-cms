'use client';

import { useVisualEditing } from '@/hooks/useVisualEditing';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import useSWR from 'swr';
import Footer from './Footer';
import NavigationBar from './NavigationBar';

type SiteGlobals = {
  logo?: string;
  logo_dark_mode?: string;
  social_links?: { service: string; url: string }[];
};

interface VisualEditingLayoutProps {
  headerNavigation: any;
  footerNavigation: any;
  globals: any;
  children: ReactNode;
}

export default function VisualEditingLayout({
  headerNavigation,
  footerNavigation,
  globals,
  children,
}: VisualEditingLayoutProps) {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const { data: siteData, mutate } = useSWR(
    isVisualEditingEnabled ? '/api/site-data?visual-editing=true' : null,
    fetchSiteData,
    {
      fallbackData: { globals, headerNavigation, footerNavigation },
      revalidateOnFocus: false,
    },
  );

  const layoutData = siteData ?? {
    globals,
    headerNavigation,
    footerNavigation,
  };
  const safeGlobals = (layoutData.globals ?? {}) as SiteGlobals;
  const safeHeaderNavigation = (layoutData.headerNavigation ?? { items: [] }) as any;
  const safeFooterNavigation = (layoutData.footerNavigation ?? { items: [] }) as any;

  useEffect(() => {
    if (!isVisualEditingEnabled) return;

    console.log('[VisualEditingLayout] enabling layout overlays', {
      hasNavRef: Boolean(navRef.current),
      hasFooterRef: Boolean(footerRef.current),
    });

    if (navRef.current) {
      try {
        apply({
          elements: [navRef.current],
          onSaved: () => {
            mutate();
          },
        });
      } catch (error) {
        console.error('[VisualEditingLayout] Failed to apply visual editing to nav', error);
      }
    }

    if (footerRef.current) {
      console.warn('[VisualEditingLayout] Footer visual editing temporarily disabled for isolation.');
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  return (
    <>
      <NavigationBar ref={navRef} navigation={safeHeaderNavigation} globals={safeGlobals} />
      {children}
      <Footer ref={footerRef} navigation={safeFooterNavigation} globals={safeGlobals} />
    </>
  );
}
