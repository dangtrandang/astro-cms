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

  const { data: siteData, mutate } = useSWR(isVisualEditingEnabled ? '/api/site-data' : null, fetchSiteData, {
    fallbackData: { globals, headerNavigation, footerNavigation },
    revalidateOnFocus: false,
  });

  const layoutData = siteData ?? {
    globals,
    headerNavigation,
    footerNavigation,
  };
  const safeGlobals = (layoutData.globals ?? {}) as SiteGlobals;

  useEffect(() => {
    if (isVisualEditingEnabled) {
      if (navRef.current) {
        apply({
          elements: [navRef.current],
          onSaved: () => {
            mutate();
          },
        });
      }

      if (footerRef.current) {
        apply({
          elements: [footerRef.current],
          onSaved: () => {
            mutate();
          },
        });
      }
    }
  }, [isVisualEditingEnabled, apply, mutate]);

  return <>{children}</>;
}
