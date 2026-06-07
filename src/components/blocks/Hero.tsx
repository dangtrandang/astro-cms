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
    <section className="relative flex min-h-screen w-full items-end sm:items-center overflow-hidden sm:h-screen">
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[75%] sm:object-center"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <img src={imageSrc} alt="Hero background" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      <div className="absolute inset-0 bg-white/10" />

      <div className="relative z-10 w-full px-6 pb-20 pt-20 sm:px-11 sm:pb-22 sm:pt-34 lg:px-18 xl:px-22 2xl:px-24">
        <div className="max-w-[52rem] text-left">
          <p className="text-[1.02rem] uppercase tracking-[0.21em] text-[#c98383] sm:text-[1.18rem] lg:text-[1.3rem]">
            HỒNG NGỌC HUYỀN HỌC
          </p>
          <h1
            className="mt-6 font-heading text-[5rem] italic font-semibold leading-[0.82] text-[#2f2626] sm:text-[6.7rem] lg:text-[8rem] xl:text-[8.75rem]"
            style={{ letterSpacing: '-0.048em' }}
            data-directus={setAttr({
              collection: 'block_hero',
              item: heroId,
              fields: ['headline'],
              mode: 'popover',
            })}
            dangerouslySetInnerHTML={{ __html: linkflowHeadline }}
          />
          <p
            className="mt-9 max-w-[40rem] text-[1.18rem] leading-[1.9] text-[#7a6661] sm:text-[1.32rem] lg:text-[1.5rem]"
            data-directus={setAttr({
              collection: 'block_hero',
              item: heroId,
              fields: ['content'],
              mode: 'popover',
            })}
          >
            {linkflowContent}
          </p>
          <button className="mt-7 sm:mt-11 inline-flex items-center gap-3 sm:gap-4 rounded-[1.25rem] bg-dusty-blue px-6 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-[1.08rem] lg:text-[1.18rem] font-semibold text-cream shadow-sm transition-colors hover:bg-charcoal">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Trò chuyện cùng Ngọc</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Hero({ data }: HeroProps) {
  const headline = data.headline || 'Nhìn <span class="text-[#D28080]">rõ hơn</span><br />một chút.';
  const content =
    data.content ||
    'Một không gian để bạn được lắng nghe, nhìn lại và gỡ rối những điều đang bế tắc. Bằng huyền học, Bằng góc nhìn. Và bằng sự thấu hiểu.';
  const linkflowVideoSrc = resolveDirectusFileUrl(data.video) || LINKFLOW_VIDEO_URL;
  const linkflowImageSrc = resolveDirectusFileUrl(data.image);

  if (isHeroLinkflowVariant(data.variant)) {
    const linkflowHeadline = headline || 'Nhìn <span class="text-[#D28080]">rõ hơn</span><br />một chút.';
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
