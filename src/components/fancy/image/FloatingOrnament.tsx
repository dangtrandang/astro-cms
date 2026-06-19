'use client';

import { useEffect, useState } from 'react';

interface FloatingOrnamentProps {
  imageSrc: string;
  side: 'left' | 'right';
  topClass: string;
  offsetClass: string;
  widthClass?: string;
  scrollFactor?: number;
  opacityClass?: string;
  rotationDirection?: 'clockwise' | 'counter-clockwise';
  animationDuration?: string;
  zIndexClass?: string;
}

export default function FloatingOrnament({
  imageSrc,
  side,
  topClass,
  offsetClass,
  widthClass = 'w-56 sm:w-80 md:w-[32rem] lg:w-[44rem] xl:w-[56rem] 2xl:w-[68rem]',
  scrollFactor = 0.12,
  opacityClass = 'opacity-85',
  rotationDirection = 'clockwise',
  animationDuration = '8s',
  zIndexClass = 'z-30',
}: FloatingOrnamentProps) {
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setTranslateY(window.scrollY * scrollFactor);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollFactor]);

  const rotation = rotationDirection === 'clockwise' ? '2.5deg' : '-2.5deg';
  const animName = `ornament-float-${side}-${rotationDirection}`;

  const styles = `
    @keyframes ${animName} {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-18px) rotate(${rotation});
      }
    }
    .animate-${animName} {
      animation: ${animName} ${animationDuration} ease-in-out infinite;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        className={`absolute pointer-events-none h-auto transition-transform duration-100 ease-out will-change-transform ${topClass} ${offsetClass} ${widthClass} ${opacityClass} ${zIndexClass}`}
        style={{
          transform: `translateY(${translateY}px) translateZ(0)`,
        }}
      >
        <img
          src={imageSrc}
          alt={`Floating ornament ${side}`}
          className={`w-full h-auto select-none animate-${animName}`}
          draggable="false"
        />
      </div>
    </>
  );
}
