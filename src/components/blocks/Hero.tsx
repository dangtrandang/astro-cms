import { setAttr } from '@directus/visual-editing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import type { ButtonProps } from '@/components/blocks/Button';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4';

interface HeroProps {
  data: {
    id: string;
    title?: string | null;
    headline?: string | null;
    content?: string | null;
    description?: string | null;
    tagline?: string | null;
    image?: string | { id?: string | null } | null;
    image_position?: 'left' | 'right' | null;
    layout?: 'image_left' | 'image_center' | 'image_right' | null;
    button_group?: {
      id: string;
      buttons?: ButtonProps[];
    } | null;
  };
}

const NAV_ITEMS = ['Home', 'Studio', 'About', 'Journal', 'Reach Us'];

export default function Hero({ data }: HeroProps) {
  const headline = data.headline || 'Focus in a Distracted World';
  const content =
    data.content ||
    "We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.";
  const eyebrow = data.title || 'Creative direction';
  const hasButtons = Boolean(data.button_group?.buttons?.length);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="px-8 py-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6">
            <a href="#" className="font-serif-display text-3xl tracking-tight text-white">
              Velorah<sup className="text-xs">®</sup>
            </a>

            <div className="hidden items-center gap-10 md:flex">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-white transition-opacity hover:opacity-80"
                >
                  {item}
                </a>
              ))}
            </div>

            <a
              href="#"
              className="liquid-glass inline-flex rounded-full px-6 py-2.5 text-sm text-white transition-transform duration-300 hover:scale-[1.03]"
            >
              Begin Journey
            </a>
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-center px-6 pb-40 pt-32 text-center">
          <div className="flex max-w-7xl flex-col items-center justify-center">
            <div
              className="animate-fade-rise text-sm uppercase tracking-[0.32em] text-white/70"
              data-directus={setAttr({
                collection: 'block_hero',
                item: data.id,
                fields: 'title',
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
                fields: 'headline',
                mode: 'popover',
              })}
              dangerouslySetInnerHTML={{ __html: headline }}
            />

            <div
              className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white sm:text-lg"
              data-directus={setAttr({
                collection: 'block_hero',
                item: data.id,
                fields: 'content',
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
                  fields: 'buttons',
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
