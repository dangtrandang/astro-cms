import { useEffect, useMemo, useState } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Eye, X } from 'lucide-react';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import Floating, { FloatingElement } from '@/components/fancy/image/parallax-floating';
import { motion, stagger, useAnimate } from 'framer-motion';

interface GalleryFileAsset {
  id: string;
  title?: string | null;
  description?: string | null;
}

interface GalleryItem {
  id: string;
  sort?: number | null;
  size?: 'small' | 'medium' | 'large' | null;
  directus_files_id?: GalleryFileAsset | string | null;
}

interface GalleryData {
  id: string;
  title?: string | null;
  headline?: string | null;
  variant?: 'grid' | 'accordion' | 'floating' | null;
  background_color?: string | null;
  background_image?: GalleryFileAsset | string | null;
  background_video?: GalleryFileAsset | string | null;
  gallery_items?: GalleryItem[] | null;
}

interface GalleryProps {
  data: GalleryData;
}

interface ResolvedGalleryItem {
  id: string;
  sort: number;
  size: 'small' | 'medium' | 'large';
  fileId: string;
  title: string;
  description: string;
}

const Gallery = ({ data }: GalleryProps) => {
  const { title, headline, variant, background_color, background_image, background_video, gallery_items, id } = data;

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
          size: item.size ?? 'medium',
          fileId,
          title: fileMeta?.title ?? '',
          description: fileMeta?.description ?? '',
        };
      })
      .filter((item): item is ResolvedGalleryItem => item !== null)
      .sort((a, b) => a.sort - b.sort);
  }, [gallery_items]);

  const isAccordion = (variant ?? 'accordion') === 'accordion';
  const isFloating = variant === 'floating';
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

  /* ---- FLOATING variant ---- */
  if (isFloating) return <FloatingGallery data={data} items={sortedItems} />;

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
          <DialogContent className="max-w-[96vw] border-none bg-transparent p-0 shadow-none sm:max-w-[45vw]" hideCloseButton>
            <DialogTitle className="sr-only">Gallery lightbox</DialogTitle>
            <DialogDescription className="sr-only">Xem anh phong to trong bo suu tap.</DialogDescription>

            <div
              className="flex h-[92vh] w-full items-center justify-center bg-black/88 px-4 py-6 sm:px-8"
              onClick={() => setLightboxOpen(false)}
              role="presentation"
            >
              <div onClick={(e) => e.stopPropagation()} className="relative inline-flex items-center justify-center">
                <DirectusImage
                  uuid={sortedItems[currentIndex].fileId}
                  alt={headline || title || `Gallery image ${currentIndex + 1}`}
                  width={1600}
                  height={1100}
                  className="max-h-[calc(92vh-3rem)] max-w-full object-contain"
                />

                <DialogClose asChild>
                  <button
                    type="button"
                    className="absolute right-1 top-1 inline-flex h-10 w-10 -translate-y-full translate-x-full items-center justify-center rounded-full border border-white/40 bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                    aria-label="Dong lightbox"
                  >
                    <X className="size-5" />
                  </button>
                </DialogClose>

                {sortedItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPrev();
                      }}
                      className="absolute left-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                      aria-label="Anh truoc"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showNext();
                      }}
                      className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                      aria-label="Anh tiep theo"
                    >
                      <ArrowRight className="size-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  FloatingGallery – variant nổi với mouse-driven parallax             */
/* ------------------------------------------------------------------ */

/** Sinh vị trí động cho N ảnh, phân bổ trải đều toàn màn hình bằng phân phối golden-angle */
/**
 * Sinh vị trí cho N ảnh:
 * - Chia khung hình thành lưới vùng (cols × rows) đảm bảo phủ đều
 * - Mỗi ảnh rơi vào tâm 1 vùng + jitter ngẫu nhiên trong vùng
 * - Ảnh large ưu tiên vùng rìa (nhiều không gian hơn)
 * - Các ảnh có thể chồng nhẹ lên nhau ở biên vùng
 */
function generateFloatingPositions(
  count: number,
  sizes: ('small' | 'medium' | 'large')[],
): { top: string; left: string; depth: number }[] {
  if (count <= 0) return [];

  // Xác định lưới: ưu tiên ngang > dọc, tối thiểu 2 hàng
  const cols = count <= 3 ? count : count <= 6 ? 3 : Math.ceil(Math.sqrt(count * 1.4));
  const rows = Math.ceil(count / cols);

  const cellW = 1 / cols;
  const cellH = 1 / rows;

  // Tạo mảng chỉ số vùng, ưu tiên vùng rìa cho ảnh large
  const zoneIndices = Array.from({ length: count }, (_, i) => i);

  // Sắp xếp: ảnh large nhận vùng rìa (góc/ biên), ảnh small nhận vùng giữa
  const sizePriority: Record<string, number> = { large: 0, medium: 1, small: 2 };
  const sortedIndices = zoneIndices
    .map((zoneIdx, itemIdx) => ({ zoneIdx, itemIdx, size: sizes[itemIdx] || 'medium' }))
    .sort((a, b) => {
      // Sắp theo độ "rìa" của vùng (ưu tiên góc) rồi theo size
      const aCol = a.zoneIdx % cols;
      const aRow = Math.floor(a.zoneIdx / cols);
      const bCol = b.zoneIdx % cols;
      const bRow = Math.floor(b.zoneIdx / cols);
      const aEdge = (aCol === 0 || aCol === cols - 1 ? 1 : 0) + (aRow === 0 || aRow === rows - 1 ? 1 : 0);
      const bEdge = (bCol === 0 || bCol === cols - 1 ? 1 : 0) + (bRow === 0 || bRow === rows - 1 ? 1 : 0);
      return bEdge - aEdge || sizePriority[a.size] - sizePriority[b.size];
    });

  // Map: ảnh gốc index -> vùng được gán
  const itemToZone = new Map<number, number>();
  const usedZones = new Set<number>();

  for (const { itemIdx } of sortedIndices) {
    // Tìm vùng chưa dùng, ưu tiên vùng rìa cho large
    const size = sizes[itemIdx] || 'medium';
    let bestZone = -1;

    for (let z = 0; z < count; z++) {
      if (usedZones.has(z)) continue;
      const col = z % cols;
      const row = Math.floor(z / cols);
      const edgeScore = (col === 0 || col === cols - 1 ? 1 : 0) + (row === 0 || row === rows - 1 ? 1 : 0);

      if (bestZone === -1) {
        bestZone = z;
        continue;
      }
      const bestCol = bestZone % cols;
      const bestRow = Math.floor(bestZone / cols);
      const bestEdge = (bestCol === 0 || bestCol === cols - 1 ? 1 : 0) + (bestRow === 0 || bestRow === rows - 1 ? 1 : 0);

      // Large ưu tiên vùng rìa, small ưu tiên vùng giữa
      if (size === 'large' && edgeScore > bestEdge) bestZone = z;
      else if (size === 'small' && edgeScore < bestEdge) bestZone = z;
    }

    itemToZone.set(itemIdx, bestZone);
    usedZones.add(bestZone);
  }

  // Sinh tọa độ cho từng ảnh
  const positions: { top: string; left: string; depth: number }[] = [];

  for (let i = 0; i < count; i++) {
    const zoneIdx = itemToZone.get(i) ?? i;
    const col = zoneIdx % cols;
    const row = Math.floor(zoneIdx / cols);

    // Tâm vùng (phần trăm)
    const zoneCenterX = (col + 0.5) * cellW;
    const zoneCenterY = (row + 0.5) * cellH;

    // Jitter ngẫu nhiên trong vùng: ±40% kích thước vùng (cho phép chồng nhẹ sang vùng kế)
    const seedX = ((i * 137 + 42) % 100) / 100;
    const seedY = ((i * 251 + 73) % 100) / 100;
    const jitterX = (seedX - 0.5) * cellW * 0.85;
    const jitterY = (seedY - 0.5) * cellH * 0.85;

    // Định vị theo tâm ảnh nên có thể nới rộng clamp
    const left = Math.max(0.04, Math.min(0.96, zoneCenterX + jitterX));
    const top = Math.max(0.04, Math.min(0.96, zoneCenterY + jitterY));

    // Depth: large ở xa (depth cao), small ở gần
    const size = sizes[i] || 'medium';
    const depthBase = size === 'large' ? 0.6 : size === 'small' ? 0.2 : 0.4;
    const depth = depthBase + ((i * 0.173 + 0.42) % 1) * 1.6;

    positions.push({
      top: `${(top * 100).toFixed(1)}%`,
      left: `${(left * 100).toFixed(1)}%`,
      depth: Math.round(depth * 10) / 10,
    });
  }

  return positions;
}

interface FloatingGalleryProps {
  data: GalleryData;
  items: ResolvedGalleryItem[];
}

function FloatingGallery({ data, items }: FloatingGalleryProps) {
  const { title, headline, background_color, background_image, background_video, id } = data;
  const [scope, animate] = useAnimate();

  const positions = useMemo(
    () => generateFloatingPositions(items.length, items.map((i) => i.size)),
    [items],
  );

  useEffect(() => {
    animate('img', { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) });
  }, [animate]);

  const displayTitle = title || 'Mỗi vấn đề sẽ có 1 công cụ chuyên biệt';
  const displayHeadline =
    headline ||
    'Có nhiều vấn đề phải sử dụng nhiều công cụ và chuyên môn khác nhau, như tarot, thần số, tử vi, phong thuỷ...';

  const backgroundImageId = typeof background_image === 'string' ? background_image : background_image?.id;
  const backgroundVideoId = typeof background_video === 'string' ? background_video : background_video?.id;

  return (
    <section
      className="relative flex h-[85vh] w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: background_color || '#FCF5EE' }}
      ref={scope}
    >
      {backgroundImageId ? (
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.PUBLIC_DIRECTUS_URL}/assets/${backgroundImageId}`}
            alt={title || 'Gallery background'}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {backgroundVideoId ? (
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={`${import.meta.env.PUBLIC_DIRECTUS_URL}/assets/${backgroundVideoId}`} />
          </video>
        </div>
      ) : null}

      {(backgroundImageId || backgroundVideoId) ? <div className="absolute inset-0 bg-white/20" /> : null}

      {/* ---- Floating images ---- */}
      <div className="absolute inset-0">
        <Floating sensitivity={-1} className="h-full w-full overflow-hidden">
          {items.map((item, index) => {
            const pos = positions[index];

            const sizeClass =
              item.size === 'small'
                ? 'w-[106px] h-[106px] md:w-[144px] md:h-[144px]'
                : item.size === 'large'
                  ? 'w-[264px] h-[384px] md:w-[384px] md:h-[528px]'
                  : 'w-[168px] h-[168px] md:w-[240px] md:h-[240px]';

            return (
              <FloatingElement key={item.id} depth={pos.depth} style={{ top: pos.top, left: pos.left }}>
                <motion.img
                  initial={{ opacity: 0 }}
                  src={`${import.meta.env.PUBLIC_DIRECTUS_URL}/assets/${item.fileId}`}
                  alt={headline || title || `Ảnh ${index + 1}`}
                  className={`${sizeClass} -translate-x-1/2 -translate-y-1/2 rounded-xl object-cover shadow-[0_10px_30px_rgba(133,14,53,0.08)] hover:scale-105 duration-200 cursor-pointer transition-transform`}
                />
              </FloatingElement>
            );
          })}
        </Floating>
      </div>

      {/* ---- Text overlay ---- */}
      <motion.div
        className="z-10 mx-auto flex w-[calc(100%-2rem)] max-w-3xl flex-col items-center gap-6 rounded-[28px] border border-white/45 bg-white/75 px-5 py-8 text-center shadow-[0_18px_50px_rgba(133,14,53,0.12)] backdrop-blur-sm md:gap-8 md:px-10 md:py-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, delay: 1.5 }}
      >
        <h2
          className="font-heading text-4xl font-bold not-italic leading-[1.02] tracking-[-0.02em] text-[#850E35] md:text-5xl lg:text-6xl"
          data-directus={setAttr({
            collection: 'block_gallery',
            item: id,
            fields: ['title'],
            mode: 'popover',
          })}
        >
          {displayTitle}
        </h2>

        <div
          className="max-w-2xl text-pretty text-base leading-8 text-[#3e2a2a] md:text-lg md:leading-9"
          data-directus={setAttr({
            collection: 'block_gallery',
            item: id,
            fields: ['headline'],
            mode: 'popover',
          })}
          dangerouslySetInnerHTML={{ __html: displayHeadline }}
        />

        <a
          href="/lien-he"
          className="mt-2 inline-flex rounded-xl bg-[#850E35] px-10 py-3.5 text-base font-medium text-[#FCF5EE] shadow-[0_8px_24px_rgba(133,14,53,0.18)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(133,14,53,0.28)]"
        >
          Cùng kết nối
        </a>
      </motion.div>
    </section>
  );
}


export default Gallery;
