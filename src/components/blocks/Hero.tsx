import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import type { ButtonProps } from '@/components/blocks/Button';

const DEFAULT_HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4';
const HERO_VIDEO_VARIANT_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';
const HERO_VIDEO_LINES = ['Shaping tomorrow', 'with vision and action.'];
const HERO_VIDEO_SUBHEADING = 'We back visionaries and craft ventures that define what comes next.';
const HERO_VIDEO_CHAR_DELAY = 30;
const HERO_VIDEO_INITIAL_DELAY = 200;
const HERO_VIDEO_CHAR_DURATION = 500;

interface HeroProps {
  data: {
    id: string;
    title?: string | null;
    headline?: string | null;
    content?: string | null;
    description?: string | null;
    tagline?: string | null;
    variant?: 'default' | 'video' | null;
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
  return variant === 'video';
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

export default function Hero({ data }: HeroProps) {
  const headline = data.headline || 'Focus in a Distracted World';
  const content =
    data.content ||
    "We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.";
  const eyebrow = data.title || 'Creative direction';
  const hasButtons = Boolean(data.button_group?.buttons?.length);
  const isHeroVideo = isHeroVideoVariant(data.variant);

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
