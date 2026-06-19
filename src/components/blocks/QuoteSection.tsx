
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function QuoteSection() {
  const [mouseGradientStyle, setMouseGradientStyle] = useState({
    left: '0px',
    top: '0px',
    opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const wordElements = document.querySelectorAll('.word-animate');
    wordElements.forEach((word) => {
      const delay = parseInt(word.getAttribute('data-delay') || '0');
      setTimeout(() => {
        (word as HTMLElement).style.animation =
          'word-appear 0.8s ease-out forwards';
      }, delay);
    });
  }, [triggered]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setMouseGradientStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    setMouseGradientStyle({
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    const handleMouseLeave = () =>
      setMouseGradientStyle((prev) => ({ ...prev, opacity: 0 }));
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        return;
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(
        () =>
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)),
        1000,
      );
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const pageStyles = `
    #mouse-gradient-quote {
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      background-image: radial-gradient(circle, rgba(111,134,149,0.04), rgba(111,134,149,0.04), transparent 70%);
      transform: translate(-50%, -50%);
      will-change: left, top, opacity;
      transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
    }
    @keyframes word-appear {
      0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); }
      50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes grid-draw {
      0% { stroke-dashoffset: 1000; opacity: 0; }
      50% { opacity: 0.3; }
      100% { stroke-dashoffset: 0; opacity: 0.12; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
      25% { transform: translateY(-10px) translateX(5px); opacity: 0.45; }
      50% { transform: translateY(-5px) translateX(-3px); opacity: 0.3; }
      75% { transform: translateY(-15px) translateX(7px); opacity: 0.6; }
    }
    .word-animate {
      display: inline-block;
      opacity: 0;
      margin: 0 0.08em;
      transition: color 0.3s ease, transform 0.3s ease;
    }
    .word-animate:hover {
      transform: translateY(-2px);
    }
    .grid-line {
      stroke: #6F8695;
      stroke-width: 0.5;
      opacity: 0;
      stroke-dasharray: 5 5;
      stroke-dashoffset: 1000;
      animation: grid-draw 2s ease-out forwards;
    }
    .floating-element-animate {
      position: absolute;
      width: 3px;
      height: 3px;
      background: #DDB8B2;
      border-radius: 50%;
      opacity: 0;
      animation: float 4s ease-in-out infinite;
    }
    .ripple-effect {
      position: fixed;
      width: 4px;
      height: 4px;
      background: rgba(111,134,149,0.4);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: ripple-pulse 1s ease-out forwards;
      z-index: 9999;
    }
    @keyframes ripple-pulse {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      100% { transform: translate(-50%, -50%) scale(15); opacity: 0; }
    }
  `;

  const line1 = [
    { text: 'Có những', delay: 200 },
    { text: '"vấn đề"', delay: 300, highlight: true },
    { text: 'không thể', delay: 400 },
    { text: 'thay đổi.', delay: 500 },
  ];

  const line2 = [
    { text: 'Nhưng', delay: 800 },
    { text: '"góc nhìn"', delay: 900, highlight: true },
    { text: 'thì', delay: 1000 },
    { text: 'có thể.', delay: 1100 },
  ];

  return (
    <>
      <style>{pageStyles}</style>
      <section
        ref={sectionRef}
        className="relative px-6 py-20 sm:px-8 lg:px-10 lg:py-28 bg-transparent"
      >
        <div className="absolute inset-0 bg-cream z-0 pointer-events-none" />

        <div className="pointer-events-none absolute inset-0 opacity-40 z-0">
          <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
        </div>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full z-0"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="15%"
            x2="100%"
            y2="15%"
            className="grid-line"
            style={{ animationDelay: '0.3s' }}
          />
          <line
            x1="0"
            y1="85%"
            x2="100%"
            y2="85%"
            className="grid-line"
            style={{ animationDelay: '0.7s' }}
          />
          <circle
            cx="12%"
            cy="15%"
            r="2"
            className="grid-line"
            style={{
              animationDelay: '1.2s',
              fill: '#DDB8B2',
              stroke: 'none',
              opacity: '0.2',
            }}
          />
          <circle
            cx="88%"
            cy="15%"
            r="2"
            className="grid-line"
            style={{
              animationDelay: '1.4s',
              fill: '#DDB8B2',
              stroke: 'none',
              opacity: '0.2',
            }}
          />
          <circle
            cx="15%"
            cy="85%"
            r="2"
            className="grid-line"
            style={{
              animationDelay: '1.6s',
              fill: '#DDB8B2',
              stroke: 'none',
              opacity: '0.2',
            }}
          />
          <circle
            cx="85%"
            cy="85%"
            r="2"
            className="grid-line"
            style={{
              animationDelay: '1.8s',
              fill: '#DDB8B2',
              stroke: 'none',
              opacity: '0.2',
            }}
          />
        </svg>

        <div
          className="floating-element-animate z-0"
          style={{ top: '20%', left: '10%', animationDelay: '0.5s' }}
        />
        <div
          className="floating-element-animate z-0"
          style={{ top: '70%', left: '88%', animationDelay: '1s' }}
        />
        <div
          className="floating-element-animate z-0"
          style={{ top: '45%', left: '8%', animationDelay: '1.8s' }}
        />

        <figure className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <blockquote className="font-heading text-charcoal">
            {/* Desktop: 2 dòng — hidden trên mobile */}
            <p className="hidden sm:block text-[clamp(1.8rem,5vw,4rem)] italic leading-[1.35] tracking-[-0.03em]">
              <span className="block">
                {line1.map((word, i) => (
                  <span
                    key={i}
                    className="word-animate"
                    style={word.highlight ? { color: '#d28080' } : undefined}
                    data-delay={word.delay}
                  >
                    {word.text}
                  </span>
                ))}
              </span>
              <span className="block mt-3">
                {line2.map((word, i) => (
                  <span
                    key={i}
                    className="word-animate"
                    style={word.highlight ? { color: '#d28080' } : undefined}
                    data-delay={word.delay}
                  >
                    {word.text}
                  </span>
                ))}
              </span>
            </p>

            {/* Mobile: 3 dòng — hidden trên desktop */}
            <p className="sm:hidden text-[clamp(1.8rem,6.5vw,3.2rem)] italic leading-[1.35] tracking-[-0.03em]">
              <span className="block">
                <span className="word-animate" data-delay="200">Có những </span>
                <span className="word-animate" style={{ color: '#d28080' }} data-delay="300">"vấn đề"</span>
              </span>
              <span className="block mt-2">
                <span className="word-animate" data-delay="500">không thể</span>
                <span className="word-animate" data-delay="600"> thay đổi.</span>
              </span>
              <span className="block mt-2">
                <span className="word-animate" data-delay="900">Nhưng </span>
                <span className="word-animate" style={{ color: '#d28080' }} data-delay="1000">"góc nhìn"</span>
                <span className="word-animate" data-delay="1100"> thì</span>
                <span className="word-animate" data-delay="1200"> có thể.</span>
              </span>
            </p>
          </blockquote>

          <figcaption className="mt-10 flex flex-col items-center gap-3">
            <span className="word-animate block h-px w-24 bg-gradient-to-r from-transparent via-rose-clay/55 to-transparent" data-delay="1500" />
            <p
              className="word-animate font-body text-[0.875rem] font-medium tracking-[0.16em] text-charcoal/60"
              data-delay="1600"
            >
              Hồng Ngọc Huyền Học
            </p>
          </figcaption>
        </figure>

        <div
          id="mouse-gradient-quote"
          className="h-60 w-60 blur-xl sm:h-80 sm:w-80 sm:blur-2xl md:h-96 md:w-96 md:blur-3xl z-0"
          style={{
            left: mouseGradientStyle.left,
            top: mouseGradientStyle.top,
            opacity: mouseGradientStyle.opacity,
          }}
        />

        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
          />
        ))}
      </section>
    </>
  );
}
