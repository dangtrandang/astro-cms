import { useState } from 'react';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import BoomerangVideoBg from '@/components/fancy/video/boomerang-video-bg';
import type { ButtonProps } from '@/components/blocks/Button';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';

const DEFAULT_HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4';
const HERO_VIDEO_VARIANT_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';
const HERO_VIDEO_LINES = ['Shaping tomorrow', 'with vision and action.'];
const HERO_VIDEO_SUBHEADING = 'We back visionaries and craft ventures that define what comes next.';
const HERO_VIDEO_CHAR_DELAY = 30;
const HERO_VIDEO_INITIAL_DELAY = 200;
const HERO_VIDEO_CHAR_DURATION = 500;
const LINKFLOW_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4';

interface HeroProps {
  data: {
    id: string;
    title?: string | null;
    headline?: string | null;
    content?: string | null;
    description?: string | null;
    tagline?: string | null;
    variant?: 'default' | 'video' | 'linkflow' | null;
    image?: string | { id?: string | null } | null;
    image_position?: 'left' | 'right' | null;
    layout?: 'image_left' | 'image_center' | 'image_right' | null;
    button_group?: {
      id: string;
      buttons?: ButtonProps[];
    } | null;
  };
}

function isHeroVideoVariant(variant?: string | null) {
  return variant === 'video' || variant === 'linkflow';
}

function isHeroLinkflowVariant(variant?: string | null) {
  return variant === 'linkflow';
}

function renderAnimatedHeading(lines: string[]) {
  return lines.map((line, lineIndex) => {
    const lineLength = line.length;

    return (
      <span key={`${line}-${lineIndex}`} className="block">
        {Array.from(line).map((character, charIndex) => {
          const delay = HERO_VIDEO_INITIAL_DELAY + lineIndex * lineLength * HERO_VIDEO_CHAR_DELAY + charIndex * HERO_VIDEO_CHAR_DELAY;

          return (
            <span
              key={`${character}-${lineIndex}-${charIndex}`}
              className="inline-block translate-x-[-18px] animate-hero-video-char opacity-0"
              style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${HERO_VIDEO_CHAR_DURATION}ms`,
              }}
            >
              {character === ' ' ? '\u00A0' : character}
            </span>
          );
        })}
      </span>
    );
  });
}

function LinkflowHero({
  linkflowHeadline,
  linkflowContent,
  navLinks,
  heroId,
}: {
  linkflowHeadline: string;
  linkflowContent: string;
  navLinks: { href: string; label: string }[];
  heroId: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative w-full min-h-[80vh] sm:h-screen overflow-hidden flex items-center justify-center">
      <BoomerangVideoBg src={LINKFLOW_VIDEO_URL} className="absolute inset-0 w-full h-full" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6">
        <div className="flex items-center gap-2 text-[#2d3a2a]">
          <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
            LinkFlow<sup className="text-[10px] sm:text-xs font-medium">TM</sup>
          </span>
        </div>

        {/* Desktop nav pill */}
        <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-2 transition-colors ${i === 0
                ? 'font-semibold text-[#1f2a1d]'
                : 'font-medium text-[#4b5b47] hover:text-[#1f2a1d]'
                }`}
            >
              {link.label}
            </a>
          ))}
          <button className="ml-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
            Try it Live
          </button>
        </div>

        {/* Right side: auth links + hamburger */}
        <div className="flex items-center gap-3 sm:gap-6 text-[#2d3a2a]">
          <a
            href="#signup"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            Sign Me Up!
          </a>
          <a
            href="#login"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Enter
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[#1f2a1d] transition-all duration-300 hover:bg-white/90"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <Menu
              className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen
                ? 'opacity-0 rotate-90 scale-50'
                : 'opacity-100 rotate-0 scale-100'
                }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-50'
                }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-semibold text-[#1f2a1d] py-4 border-b border-[#1f2a1d]/10 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <a
              href="#signup"
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden"
            >
              <UserPlus className="w-4 h-4" />
              Sign Me Up!
            </a>
            <a
              href="#login"
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden"
            >
              <LogIn className="w-4 h-4" />
              Enter
            </a>
            <button className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors">
              Try it Live
            </button>
          </div>
        </div>
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6">
        <h1
          className="font-normal leading-[0.95] text-[#850E35] text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.75rem] xl:text-[5.25rem] max-w-5xl"
          style={{ letterSpacing: '-0.035em' }}
          data-directus={setAttr({
            collection: 'block_hero',
            item: heroId,
            fields: ['headline'],
            mode: 'popover',
          })}
          dangerouslySetInnerHTML={{ __html: linkflowHeadline }}
        />
        <p
          className="mt-6 sm:mt-8 text-[#3e2a2a] text-sm sm:text-base md:text-lg leading-relaxed max-w-md px-2"
          data-directus={setAttr({
            collection: 'block_hero',
            item: heroId,
            fields: ['content'],
            mode: 'popover',
          })}
        >
          {linkflowContent}
        </p>
        <button className="mt-8 sm:mt-10 bg-[#850E35] hover:bg-[#6b0b2b] text-white text-sm sm:text-base font-semibold px-8 sm:px-10 py-3 sm:py-3.5 rounded-full transition-colors shadow-sm">
          Cùng kết nối
        </button>
      </div>
    </section>
  );
}

export default function Hero({ data }: HeroProps) {
  const headline = data.headline || 'Focus in a Distracted World';
  const content =
    data.content ||
    "We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.";
  const eyebrow = data.title || 'Creative direction';
  const hasButtons = Boolean(data.button_group?.buttons?.length);
  const isHeroLinkflow = isHeroLinkflowVariant(data.variant);
  const isHeroVideo = isHeroVideoVariant(data.variant);

  if (isHeroLinkflow) {
    const navLinks = [
      { href: '#mission', label: 'Purpose' },
      { href: '#how', label: 'The Process' },
      { href: '#pricing', label: 'Tariffs' },
    ];

    const linkflowHeadline =
      headline ||
      'Close the rift <span class="text-[#85AB8B]">linking<br class="hidden sm:block" /> signals and action</span>';
    const linkflowContent =
      content ||
      'Shape scattered signals into meaningful outcomes via AI-driven workflows.';

    return (
      <LinkflowHero
        linkflowHeadline={linkflowHeadline}
        linkflowContent={linkflowContent}
        navLinks={navLinks}
        heroId={data.id}
      />
    );
  }

  if (isHeroVideo) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-black pt-16 text-white md:pt-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO_VARIANT_URL} type="video/mp4" />
        </video>

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col justify-end px-6 pb-12 pt-24 md:px-12 lg:px-16 lg:pb-16 lg:pt-28">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">
              <div>
                <h1
                  className="mb-4 text-4xl font-normal leading-none text-white md:text-5xl lg:text-6xl xl:text-7xl"
                  style={{ letterSpacing: '-0.04em' }}
                  data-directus={setAttr({
                    collection: 'block_hero',
                    item: data.id,
                    fields: ['headline'],
                    mode: 'popover',
                  })}
                >
                  {renderAnimatedHeading(HERO_VIDEO_LINES)}
                </h1>

                <p
                  className="animate-hero-video-fade mb-5 max-w-2xl text-base text-gray-300 md:text-lg"
                  style={{ animationDelay: '800ms', animationDuration: '1000ms' }}
                  data-directus={setAttr({
                    collection: 'block_hero',
                    item: data.id,
                    fields: ['content'],
                    mode: 'popover',
                  })}
                >
                  {HERO_VIDEO_SUBHEADING}
                </p>

                <div className="animate-hero-video-fade flex flex-wrap gap-4" style={{ animationDelay: '1200ms', animationDuration: '1000ms' }}>
                  <a
                    href="#"
                    className="inline-flex rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100"
                  >
                    Start a Chat
                  </a>
                  <a
                    href="#"
                    className="liquid-glass inline-flex rounded-lg border border-white/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Explore Now
                  </a>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
                <div
                  className="liquid-glass animate-hero-video-fade rounded-xl border border-white/20 px-6 py-3"
                  style={{ animationDelay: '1400ms', animationDuration: '1000ms' }}
                >
                  <p className="text-lg font-light text-white md:text-xl lg:text-2xl">
                    Investing. Building. Advisory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black pt-16 text-white md:pt-20">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={DEFAULT_HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-6 pb-40 pt-24 text-center md:pt-28">
          <div className="flex max-w-7xl flex-col items-center justify-center">
            <div
              className="animate-fade-rise text-sm uppercase tracking-[0.32em] text-white/70"
              data-directus={setAttr({
                collection: 'block_hero',
                item: data.id,
                fields: ['title'],
                mode: 'popover',
              })}
            >
              {eyebrow}
            </div>

            <h1
              className="animate-fade-rise mt-6 max-w-7xl font-serif-display text-5xl leading-[0.95] tracking-[-2.46px] text-white sm:text-7xl md:text-8xl"
              data-directus={setAttr({
                collection: 'block_hero',
                item: data.id,
                fields: ['headline'],
                mode: 'popover',
              })}
              dangerouslySetInnerHTML={{ __html: headline }}
            />

            <div
              className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white sm:text-lg"
              data-directus={setAttr({
                collection: 'block_hero',
                item: data.id,
                fields: ['content'],
                mode: 'popover',
              })}
            >
              {content}
            </div>

            {hasButtons ? (
              <div
                className="mt-12 animate-fade-rise-delay-2"
                data-directus={setAttr({
                  collection: 'block_button_group',
                  item: data.button_group!.id,
                  fields: ['buttons'],
                  mode: 'modal',
                })}
              >
                <ButtonGroup
                  buttons={data.button_group?.buttons || []}
                  className="hero-button-group justify-center"
                />
              </div>
            ) : (
              <a
                href="#"
                className="liquid-glass animate-fade-rise-delay-2 mt-12 inline-flex rounded-full px-14 py-5 text-base text-white transition-transform duration-300 hover:scale-[1.03]"
              >
                Begin Journey
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
