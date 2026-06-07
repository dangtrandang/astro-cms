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
    <section className="relative flex min-h-screen w-full items-center overflow-hidden sm:h-screen">
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

      <div className="relative z-10 w-full px-6 pb-16 pt-28 sm:px-10 sm:pb-20 sm:pt-32 lg:px-16 xl:px-20">
        <div className="max-w-[32rem] text-left">
          <p className="text-sm uppercase tracking-[0.24em] text-[#c98383] sm:text-base">
            HỒNG NGỌC HUYỀN HỌC
          </p>
          <h1
            className="mt-6 font-heading text-[3.2rem] italic font-semibold leading-[0.88] text-[#2f2626] sm:text-[4.4rem] lg:text-[5.25rem]"
            style={{ letterSpacing: '-0.04em' }}
            data-directus={setAttr({
              collection: 'block_hero',
              item: heroId,
              fields: ['headline'],
              mode: 'popover',
            })}
            dangerouslySetInnerHTML={{ __html: linkflowHeadline }}
          />
          <p
            className="mt-8 max-w-[26rem] text-base leading-[2] text-[#7a6661] sm:text-[1.125rem]"
            data-directus={setAttr({
              collection: 'block_hero',
              item: heroId,
              fields: ['content'],
              mode: 'popover',
            })}
          >
            {linkflowContent}
          </p>
          <button className="mt-10 inline-flex rounded-2xl bg-dusty-blue px-7 py-4 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-charcoal sm:px-8 sm:text-base">
            Trò chuyện cùng Ngọc
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Hero({ data }: HeroProps) {
  const headline = data.headline || 'Nhìn rõ hơn<br />một chút.';
  const content =
    data.content ||
    'Một không gian để bạn được lắng nghe, nhìn lại và gỡ rối những điều đang bế tắc. Bằng huyền học, Bằng góc nhìn. Và bằng sự thấu hiểu.';
  const linkflowVideoSrc = resolveDirectusFileUrl(data.video) || LINKFLOW_VIDEO_URL;
  const linkflowImageSrc = resolveDirectusFileUrl(data.image);

  if (isHeroLinkflowVariant(data.variant)) {
    const linkflowHeadline = headline || 'Nhìn rõ hơn<br />một chút.';
    const linkflowContent =
      content ||
      'Một không gian để bạn được lắng nghe, nhìn lại và gỡ rối những điều đang bế tắc. Bằng huyền học, Bằng góc nhìn. Và bằng sự thấu hiểu.';

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
