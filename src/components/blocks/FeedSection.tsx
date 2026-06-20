'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';

interface SocialItem {
  title: string;
  url: string;
  videoId: string;
  thumbnail: string;
  publishedAt: string;
  isShort: boolean;
  views: number;
}

function formatViews(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

interface FeedSectionProps {
  items: SocialItem[];
}

export default function FeedSection({ items: initialItems }: FeedSectionProps) {
  const items = initialItems;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const isInteracting = useRef(false);
  const totalItems = items.length || 1;
  const doubled = items.concat(items);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);

  const nextSlide = useCallback(() => {
    if (totalItems <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalItems);
    setActiveIndex(null);
  }, [totalItems]);

  const prevSlide = useCallback(() => {
    if (totalItems <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    setActiveIndex(null);
  }, [totalItems]);

  useEffect(() => {
    if (isInteracting.current || totalItems <= 1) return;
    autoPlayRef.current = setInterval(() => {
      if (!isInteracting.current && activeIndex === null) {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
      }
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [totalItems, activeIndex]);

  const pauseAutoScroll = useCallback(() => {
    isInteracting.current = true;
    if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
    setTimeout(() => { isInteracting.current = false; }, 8000);
  }, []);

  const handleCardClick = useCallback((index: number) => {
    pauseAutoScroll();
    if (window.innerWidth < 1024) {
      setLightboxIndex(index);
    } else {
      setActiveIndex((prev) => (prev === index ? null : index));
    }
  }, [pauseAutoScroll]);

  const handlePrev = useCallback(() => { pauseAutoScroll(); prevSlide(); }, [pauseAutoScroll, prevSlide]);
  const handleNext = useCallback(() => { pauseAutoScroll(); nextSlide(); }, [pauseAutoScroll, nextSlide]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    pauseAutoScroll();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  }, [pauseAutoScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const absDX = Math.abs(touchDeltaX.current);
    if (absDX > 50) {
      if (touchDeltaX.current > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  }, [handlePrev, handleNext]);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-soft-nurture px-0 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[30%_70%] lg:gap-14 lg:items-start">
          <div className="space-y-5 px-4 sm:px-0 lg:space-y-6 lg:flex lg:flex-col lg:justify-center lg:h-full">
            <h2 className="font-heading text-[clamp(2.4rem,5.5vw,2.5rem)] lg:text-[clamp(3rem,5.5vw,4rem)] font-semibold italic leading-tight text-charcoal">
              Những điều tôi đang chia sẻ
            </h2>
            <p className="font-body text-body leading-relaxed text-charcoal/80 max-w-md">
              Những video mới nhất được cập nhật đều đặn trên nhiều nền tảng.
              Nếu một chủ đề nào đó chạm đến bạn, hãy tiếp tục đồng hành cùng
              tôi trên hành trình khám phá và thấu hiểu chính mình.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-300 hover:scale-110 sm:h-11 sm:w-11" aria-label="TikTok">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href="https://www.youtube.com/@msruby9999" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white transition-all duration-300 hover:scale-110 sm:h-11 sm:w-11" aria-label="YouTube">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div
            className="relative w-full overflow-hidden px-3 sm:px-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex items-stretch transition-transform duration-500 ease-in-out"
              style={{ transform: totalItems > 0 ? `translateX(-${(currentIndex / 2) * 100}%)` : 'translateX(0)' }}
            >
              {doubled.map((item, i) => {
                const isActive = activeIndex === i;

                return (
                  <motion.div
                    key={`${item.videoId}-${i}`}
                    className="w-1/2 shrink-0 self-stretch px-0.5 sm:px-1.5 lg:w-1/3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
                  >
                    <div
                      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-rose-clay/25 bg-white transition-shadow duration-300 ease-in-out hover:shadow-lg"
                      onClick={() => handleCardClick(i)}
                    >
                      <div className="relative w-full shrink-0 overflow-hidden h-[17rem] sm:h-80 lg:h-96">
                        {isActive ? (
                          <>
                            <iframe
                              src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1`}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                            <button
                              className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex(null);
                              }}
                              aria-label="Đóng video"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-h-0 space-y-1 p-3 sm:space-y-1.5 sm:p-4">
                        <h3 className="font-body text-xs sm:text-sm font-medium leading-snug text-charcoal line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
                          {item.title}
                        </h3>
                        <p className="font-body text-[0.65rem] sm:text-meta text-charcoal/50 shrink-0">
                          {item.views > 0 ? `${formatViews(item.views)} lượt xem · ` : ''}{getRelativeDate(item.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalItems > 1 && (
              <>
                <button onClick={handlePrev} className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center rounded-full border border-rose-clay/30 bg-white/90 p-1.5 sm:p-2 text-rose-clay shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-md sm:-left-3" aria-label="Trước">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNext} className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center rounded-full border border-rose-clay/30 bg-white/90 p-1.5 sm:p-2 text-rose-clay shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-md sm:-right-3" aria-label="Sau">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null); }}>
        <DialogOverlay className="bg-black/10" />
        <DialogContent
          hideCloseButton
          className="max-w-none border-0 bg-transparent p-0 shadow-none"
          onInteractOutside={(e) => { e.preventDefault(); setLightboxIndex(null); }}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="flex min-h-dvh items-center justify-center px-[3px] animate-in fade-in duration-200" onClick={() => setLightboxIndex(null)}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <button
                  className="absolute -right-1 -top-10 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Đóng video"
                >
                  <X className="h-5 w-5" />
                </button>

                {lightboxIndex !== null && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${items[lightboxIndex].videoId}?autoplay=1`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
