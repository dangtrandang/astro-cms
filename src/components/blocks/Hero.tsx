import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import type { ButtonProps } from '@/components/blocks/Button';

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
    video?: string | { id?: string | null } | null;
    image_position?: 'left' | 'right' | null;
    layout?: 'image_left' | 'image_center' | 'image_right' | null;
    button_group?: {
      id: string;
      buttons?: ButtonProps[];
    } | null;
  };
}

function isHeroLinkflowVariant(variant?: string | null) {
  return variant === 'linkflow';
}

function resolveDirectusFileUrl(file?: string | { id?: string | null } | null) {
  const fileId = typeof file === 'string' ? file : file?.id;
  const baseUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

  if (!fileId || !baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, '')}/assets/${fileId}`;
}

function LinkflowHero({
  linkflowHeadline,
  linkflowContent,
  heroId,
  videoSrc,
  imageSrc,
}: {
  linkflowHeadline: string;
  linkflowContent: string;
  heroId: string;
  videoSrc?: string | null;
  imageSrc?: string | null;
}) {
  return (
    <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden sm:h-screen">
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <img src={imageSrc} alt="Hero background" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      <div className="absolute inset-0 bg-white/10" />

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
  const linkflowVideoSrc = resolveDirectusFileUrl(data.video) || LINKFLOW_VIDEO_URL;
  const linkflowImageSrc = resolveDirectusFileUrl(data.image);

  if (isHeroLinkflowVariant(data.variant)) {
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
        heroId={data.id}
        videoSrc={linkflowVideoSrc}
        imageSrc={linkflowImageSrc}
      />
    );
  }

  return null;
}
