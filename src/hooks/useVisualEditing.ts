'use client';

import { useState, useEffect } from 'react';

interface ApplyOptions {
  elements?: HTMLElement[] | HTMLElement;
  onSaved?: () => void;
  mode?: 'modal' | 'popover' | 'drawer';
}

export function useVisualEditing() {
  const [isVisualEditingEnabled, setIsVisualEditingEnabled] = useState(false);

  useEffect(() => {
    // Enabled by default; set to 'false' to disable
    const isEnvEnabled = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get('visual-editing');
    const hasPreviewContext =
      searchParams.get('preview') === 'true' ||
      Boolean(searchParams.get('id')) ||
      Boolean(searchParams.get('version'));

    if (!isEnvEnabled) {
      if (param === 'true' || hasPreviewContext) {
        console.warn('[useVisualEditing] Visual editing is not enabled in this environment.');
      }

      return;
    }

    if (param === 'true') {
      localStorage.setItem('visual-editing', 'true');
    } else if (param === 'false') {
      localStorage.removeItem('visual-editing');
      searchParams.delete('visual-editing');

      const cleanUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.history.replaceState({}, '', cleanUrl);
    }

    const persisted = localStorage.getItem('visual-editing') === 'true';
    const shouldEnable = param === 'true' || persisted || hasPreviewContext;

    console.log('[useVisualEditing] init', {
      pathname: window.location.pathname,
      query: window.location.search,
      param,
      persisted,
      hasPreviewContext,
      shouldEnable,
    });

    setIsVisualEditingEnabled(shouldEnable);

    if (shouldEnable && param !== 'true') {
      searchParams.set('visual-editing', 'true');

      const updatedUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.history.replaceState({}, '', updatedUrl);
    }
  }, []);

  const apply = (options: Pick<ApplyOptions, 'elements' | 'onSaved' | 'mode'>) => {
    if (!isVisualEditingEnabled) return;

    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL || '';
    const elements = Array.isArray(options.elements)
      ? options.elements.filter(Boolean)
      : options.elements
        ? [options.elements]
        : [];

    console.log('[useVisualEditing] apply', {
      directusUrl,
      elementCount: elements.length,
      mode: options.mode ?? 'popover',
    });

    if (!directusUrl) {
      console.warn('[useVisualEditing] Missing PUBLIC_DIRECTUS_URL. Skipping visual editing apply.');
      return;
    }

    if (elements.length === 0) {
      console.warn('[useVisualEditing] No elements provided for visual editing apply.');
      return;
    }

    void import('@directus/visual-editing')
      .then(({ apply: applyVisualEditing }) => {
        applyVisualEditing({
          ...options,
          elements,
          directusUrl,
        });
      })
      .catch((error) => {
        console.error('[useVisualEditing] Failed to apply visual editing', {
          directusUrl,
          elementCount: elements.length,
          mode: options.mode ?? 'popover',
          error,
        });
      });
  };

  const setAttr = (editConfig: Record<string, unknown>) => {
    return JSON.stringify(editConfig);
  };

  return {
    isVisualEditingEnabled,
    apply,
    setAttr,
  };
}
