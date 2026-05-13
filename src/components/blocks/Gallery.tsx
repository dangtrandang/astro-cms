import { useEffect, useMemo, useState } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Eye, X } from 'lucide-react';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface GalleryFileAsset {
  id: string;
  title?: string | null;
  description?: string | null;
}

interface GalleryItem {
  id: string;
  sort?: number | null;
  directus_files_id?: GalleryFileAsset | string | null;
}

interface GalleryData {
  id: string;
  title?: string | null;
  headline?: string | null;
  variant?: 'grid' | 'accordion' | null;
  gallery_items?: GalleryItem[] | null;
}

interface GalleryProps {
  data: GalleryData;
}

interface ResolvedGalleryItem {
  id: string;
  sort: number;
  fileId: string;
  title: string;
  description: string;
}

const Gallery = ({ data }: GalleryProps) => {
  const { title, headline, variant, gallery_items, id } = data;

  const sortedItems = useMemo<ResolvedGalleryItem[]>(() => {
    return (gallery_items ?? [])
      .map((item, index) => {
        const file = item.directus_files_id;
        const fileId = typeof file === 'string' ? file : file?.id;
        const fileMeta = typeof file === 'object' && file !== null ? file : null;

        if (!fileId) return null;

        return {
          id: item.id,
          sort: item.sort ?? index,
          fileId,
          title: fileMeta?.title ?? '',
          description: fileMeta?.description ?? '',
        };
      })
      .filter((item): item is ResolvedGalleryItem => item !== null)
      .sort((a, b) => a.sort - b.sort);
  }, [gallery_items]);

  const isAccordion = (variant ?? 'accordion') === 'accordion';
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setCurrentIndex(0);
  }, [sortedItems.length]);

  const hasItems = sortedItems.length > 0;
  const isValidIndex = hasItems && currentIndex >= 0 && currentIndex < sortedItems.length;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleAccordionItemClick = (index: number) => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      openLightbox(index);
      return;
    }

    setActiveIndex(index);
  };

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedItems.length) % sortedItems.length);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedItems.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (sortedItems.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrev();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen, sortedItems.length]);

  if (!hasItems) return null;

  return (
    <section className="bg-[#FCF5EE] py-16 text-[#3e2a2a] md:py-20">
      <div className="flex w-full flex-col gap-10 px-0">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 text-center sm:px-8">
          {title && (
            <h2
              className="max-w-5xl text-balance font-heading text-4xl font-semibold leading-[1.08] text-[#850E35] md:text-5xl lg:text-6xl"
              data-directus={setAttr({
                collection: 'block_gallery',
                item: id,
                fields: ['title'],
                mode: 'popover',
              })}
            >
              {title}
            </h2>
          )}

          {headline && (
            <div
              className="max-w-3xl text-pretty text-base leading-7 text-[#3e2a2a] md:text-lg md:leading-8"
              data-directus={setAttr({
                collection: 'block_gallery',
                item: id,
                fields: ['headline'],
                mode: 'popover',
              })}
              dangerouslySetInnerHTML={{ __html: headline }}
            />
          )}
        </div>

        {isAccordion ? (
          <div
            className="w-full overflow-hidden"
            data-directus={setAttr({
              collection: 'block_gallery',
              item: id,
              fields: ['gallery_items', 'variant'],
              mode: 'modal',
            })}
          >
            <div className="flex min-h-[430px] w-full flex-col gap-[6px] shadow-[0_16px_40px_rgba(62,42,42,0.14)] md:h-[550px] md:min-h-0 md:flex-row md:gap-[6px]">
              {sortedItems.map((item, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="group relative min-h-[74px] overflow-hidden text-left transition-[flex,min-height] duration-500 ease-out md:min-h-0"
                    style={{
                      flex: isActive ? 2.94 : 1,
                      minHeight: isActive ? '208px' : '74px',
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => handleAccordionItemClick(index)}
                    aria-label={`Mo anh ${index + 1}`}
                  >
                    <DirectusImage
                      uuid={item.fileId}
                      alt={headline || title || `Gallery image ${index + 1}`}
                      fill
                      sizes="100vw"
                      className="h-full w-full object-cover transition-transform delay-200 duration-500 ease-out group-hover:scale-[1.008] group-focus-visible:scale-[1.008]"
                    />

                    <div className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8">
                      <div className="flex items-center gap-2 text-[#F2D1D1] md:gap-4">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F2D1D1] bg-black/14 backdrop-blur-[2px] transition hover:bg-black/24 md:h-11 md:w-11"
                          onClick={(event) => {
                            event.stopPropagation();
                            openLightbox(index);
                          }}
                          aria-label={`Xem full anh ${index + 1}`}
                        >
                          <Eye className="size-3.5 md:size-4" />
                        </button>
                        <div className="min-w-0 border-l border-[#F2D1D1] pl-3 md:pl-4">
                          {item.title && (
                            <p className="font-heading text-sm font-medium leading-tight text-[#F2D1D1] md:text-2xl">
                              {item.title}
                            </p>
                          )}
                          {item.description && isActive && (
                            <p className="mt-1 max-w-[30rem] text-xs leading-5 text-[#F2D1D1] md:mt-2 md:text-base md:leading-6">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3"
            data-directus={setAttr({
              collection: 'block_gallery',
              item: id,
              fields: ['gallery_items', 'variant'],
              mode: 'modal',
            })}
          >
            {sortedItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="relative aspect-[4/5] overflow-hidden text-left"
                onClick={() => openLightbox(index)}
                aria-label={`Mo anh ${index + 1}`}
              >
                <DirectusImage
                  uuid={item.fileId}
                  alt={headline || title || `Gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.06]"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && isValidIndex && (
        <Dialog open={isLightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[96vw] border-none bg-transparent p-0 shadow-none sm:max-w-[94vw]" hideCloseButton>
            <DialogTitle className="sr-only">Gallery lightbox</DialogTitle>
            <DialogDescription className="sr-only">Xem anh phong to trong bo suu tap.</DialogDescription>

            <div
              className="relative flex h-[92vh] w-full items-center justify-center overflow-hidden bg-black/88 px-4 py-6 sm:px-8"
              onClick={() => setLightboxOpen(false)}
              role="presentation"
            >
              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
                <DirectusImage
                  uuid={sortedItems[currentIndex].fileId}
                  alt={headline || title || `Gallery image ${currentIndex + 1}`}
                  width={1600}
                  height={1100}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {sortedItems.length > 1 && (
                <div className="pointer-events-auto absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-4 sm:px-6">
                  <button
                    type="button"
                    onClick={showPrev}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/24"
                    aria-label="Anh truoc"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/24"
                    aria-label="Anh tiep theo"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              )}

              <DialogClose asChild>
                <button
                  type="button"
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/16 text-white backdrop-blur-sm transition hover:bg-white/28 sm:right-5 sm:top-5 sm:h-12 sm:w-12"
                  aria-label="Dong lightbox"
                >
                  <X className="size-5" />
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default Gallery;
