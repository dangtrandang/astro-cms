'use client';

import { useEffect } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { setVisualEditingAttr } from '@/lib/visualEditing';

interface VisualEditingOptions {
  customClass?: string;
  onSaved?: () => void;
  elements?: HTMLElement;
}

interface VisualEditingOverlayProps {
  pageId: string;
  onMutate: () => void;
}

export default function VisualEditingOverlay({ pageId, onMutate }: VisualEditingOverlayProps) {
  const { isVisualEditingEnabled, apply } = useVisualEditing();

  useEffect(() => {
    if (isVisualEditingEnabled) {
      apply({
        onSaved: () => {
          onMutate();
        },
      } as VisualEditingOptions);

      const editButton = document.querySelector('#visual-editing-button') as HTMLElement | null;

      if (editButton) {
        apply({
          elements: editButton,
          customClass: 'visual-editing-button-class',
          onSaved: () => {
            onMutate();
          },
        } as VisualEditingOptions);
      }
    }
  }, [isVisualEditingEnabled, apply, onMutate]);

  if (!isVisualEditingEnabled) return null;

  return (
    <>
      <div className="fixed z-[60] w-full bottom-4 inset-x-0 p-4 flex justify-center items-center gap-2">
        <Button
          id="visual-editing-button"
          variant="secondary"
          className="visual-editing-button-class"
          data-directus={setVisualEditingAttr({
            collection: 'pages',
            item: pageId,
            fields: ['blocks', 'meta_m2a_button'],
            mode: 'modal',
          })}
        >
          <Pencil className="size-4 mr-2" />
          Edit All Blocks
        </Button>
      </div>
      <style>
        {`/* Safe to remove this if you're not using the visual editor. */
          .directus-visual-editing-overlay.visual-editing-button-class .directus-visual-editing-edit-button {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform: none;
            background: transparent;
          }
          .directus-visual-editing-overlay.visual-editing-button-class {
            opacity: 0 !important;
            z-index: 70 !important;
          }
          .directus-visual-editing-overlay {
            z-index: 40 !important;
          }
        `}
      </style>
    </>
  );
}
