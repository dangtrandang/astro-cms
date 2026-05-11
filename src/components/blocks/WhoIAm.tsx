import { Instagram, Facebook, Twitter, Youtube, Sparkles, Orbit, Gem } from 'lucide-react';
import DirectusImage from '@/components/shared/DirectusImage';
import { cn } from '@/lib/utils';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface WhoIAmItem {
    icon?: string;
    title: string;
    content?: string;
}

interface SocialLink {
    platform: string;
    url?: string;
}

interface WhoIAmProps {
    data: {
        id: string;
        title?: string | null;
        eyebrow?: string | null;
        headline?: string | null;
        content?: string | null;
        portrait_image?: string | { id?: string | null } | { filename_disk?: string | null } | null;
        center_badge?: string | null;
        right_items?: WhoIAmItem[] | null;
        social_links?: SocialLink[] | null;
        theme_variant?: 'blue-mystic' | 'default' | null;
    };
}

const DEFAULT_ITEMS: WhoIAmItem[] = [
    {
        icon: 'sparkles',
        title: 'Than so hoc',
        content:
            'Con so tiet lo cach ban van hanh trong doi: tinh cach, diem manh, bai hoc linh hon va chu ky van menh. Day la ban do de ban hieu chinh minh',
    },
    {
        icon: 'orbit',
        title: 'Tarot - Doc tin hieu vu tru',
        content:
            'Toi giup ban thay ro dieu dang dien ra trong long minh: niem tin, noi so, chuong ngai va huong di phu hop.',
    },
    {
        icon: 'gem',
        title: 'Chiem tinh',
        content:
            'Khi ban lac huong, nang luong cua ban se len tieng. Toi ho tro ban giai ma tin hieu do, ket noi lai voi truc giac va tim cau tra loi tu chinh tang sau ben trong.',
    },
];

const DEFAULT_SOCIALS: SocialLink[] = [
    { platform: 'facebook', url: '#' },
    { platform: 'instagram', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'youtube', url: '#' },
];

function getImageId(image: WhoIAmProps['data']['portrait_image']) {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if ('id' in image && typeof image.id === 'string' && image.id.length > 0) return image.id;

    return null;
}

function getSocialIcon(platform: string) {
    switch (platform.toLowerCase()) {
        case 'facebook':
            return Facebook;
        case 'instagram':
            return Instagram;
        case 'twitter':
        case 'x':
            return Twitter;
        case 'youtube':
            return Youtube;
        default:
            return Sparkles;
    }
}

function getFeatureIcon(icon?: string) {
    switch ((icon || '').toLowerCase()) {
        case 'orbit':
            return Orbit;
        case 'gem':
        case 'diamond':
            return Gem;
        case 'sparkles':
        default:
            return Sparkles;
    }
}

export default function WhoIAm({ data }: WhoIAmProps) {
    const imageId = getImageId(data.portrait_image);
    const items = data.right_items?.length ? data.right_items : DEFAULT_ITEMS;
    const socials = data.social_links?.length ? data.social_links : DEFAULT_SOCIALS;
    const isBlueMystic = (data.theme_variant || 'blue-mystic') === 'blue-mystic';

    return (
        <section
            className={cn(
                'relative overflow-hidden px-6 py-20 sm:px-8 lg:px-10 lg:py-28',
                isBlueMystic ? 'bg-[#2E568D] text-white' : 'bg-[#FCF5EE] text-[#3E2A2A]'
            )}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={cn(
                        'absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border',
                        isBlueMystic ? 'border-white/10' : 'border-[#850E35]/10'
                    )}
                />
                <div
                    className={cn(
                        'absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed',
                        isBlueMystic ? 'border-white/20' : 'border-[#850E35]/15'
                    )}
                />
                <div
                    className={cn(
                        'absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl',
                        isBlueMystic ? 'bg-white/5' : 'bg-[#C6DCE4]/25'
                    )}
                />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_1fr_1.05fr] lg:items-center">
                <div className="relative z-10 max-w-xl">
                    <p
                        className={cn(
                            'text-sm font-semibold uppercase tracking-[0.32em]',
                            isBlueMystic ? 'text-[#D6A64B]' : 'text-[#850E35]/70'
                        )}
                        data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['eyebrow'], mode: 'popover' })}
                    >
                        {data.eyebrow || 'WHO AM I'}
                    </p>

                    <div
                        className={cn(
                            'mt-5 font-serif-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]',
                            isBlueMystic ? 'text-white' : 'text-[#850E35]'
                        )}
                        data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['headline'], mode: 'drawer' })}
                        dangerouslySetInnerHTML={{
                            __html: data.headline || 'Neu ban da buoc den day, ban can biet toi la ai?',
                        }}
                    />

                    <div
                        className={cn(
                            'mt-8 max-w-lg text-base leading-8 sm:text-lg',
                            isBlueMystic ? 'text-white/92' : 'text-[#3E2A2A]/85'
                        )}
                        data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['content'], mode: 'drawer' })}
                        dangerouslySetInnerHTML={{
                            __html:
                                data.content ||
                                '<p>De toi tu gioi thieu mot chut ve minh. Toi lam viec voi nang luong, bieu tuong va nhung tin hieu vu tru dang gui den cho ban. Thong qua Tarot, Than so hoc va nhung trai nghiem tam linh ca nhan, toi se giup ban nhin ro hon hanh trinh cua minh.</p>',
                        }}
                    />

                    <div
                        className="mt-10 flex flex-wrap gap-4"
                        data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['social_links'], mode: 'drawer' })}
                    >
                        {socials.map((social) => {
                            const Icon = getSocialIcon(social.platform);

                            return (
                                <a
                                    key={`${social.platform}-${social.url || '#'}`}
                                    href={social.url || '#'}
                                    className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 hover:-translate-y-1',
                                        isBlueMystic
                                            ? 'bg-[#C69A46] text-[#23497A] hover:bg-[#d5ab5c]'
                                            : 'bg-[#850E35] text-[#FCF5EE] hover:bg-[#9d1744]'
                                    )}
                                    aria-label={social.platform}
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            );
                        })}
                    </div>
                </div>

                <div className="relative flex items-center justify-center">
                    <div
                        className={cn(
                            'pointer-events-none absolute h-[26rem] w-[26rem] rounded-full border border-dashed md:h-[34rem] md:w-[34rem]',
                            isBlueMystic ? 'border-white/35' : 'border-[#850E35]/20'
                        )}
                    />
                    <div
                        className={cn(
                            'pointer-events-none absolute h-[22rem] w-[22rem] rounded-full border md:h-[30rem] md:w-[30rem]',
                            isBlueMystic ? 'border-white/20' : 'border-[#850E35]/12'
                        )}
                    />

                    {data.center_badge ? (
                        <div
                            className={cn(
                                'absolute left-1/2 top-8 -translate-x-1/2 rounded-full border px-4 py-1 text-xs uppercase tracking-[0.24em]',
                                isBlueMystic ? 'border-white/30 bg-white/10 text-white/80' : 'border-[#850E35]/15 bg-white/70 text-[#850E35]/80'
                            )}
                            data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['center_badge'], mode: 'popover' })}
                        >
                            {data.center_badge}
                        </div>
                    ) : null}

                    <div className="relative z-10 w-full max-w-[22rem] md:max-w-[26rem] lg:max-w-[28rem]">
                        {imageId ? (
                            <DirectusImage uuid={imageId} alt={data.title || 'Who I Am portrait'} className="h-auto w-full object-contain" />
                        ) : (
                            <div
                                className={cn(
                                    'aspect-[4/5] w-full rounded-[2rem] border backdrop-blur-sm',
                                    isBlueMystic ? 'border-white/20 bg-white/10' : 'border-[#850E35]/10 bg-white/70'
                                )}
                            />
                        )}
                    </div>
                </div>

                <div
                    className="relative z-10 space-y-8"
                    data-directus={setAttr({ collection: 'block_who_i_am', item: data.id, fields: ['right_items'], mode: 'drawer' })}
                >
                    {items.map((item, index) => {
                        const Icon = getFeatureIcon(item.icon);

                        return (
                            <div key={`${item.title}-${index}`} className="flex items-start gap-5">
                                <div
                                    className={cn(
                                        'flex h-16 w-16 shrink-0 items-center justify-center rounded-full border',
                                        isBlueMystic
                                            ? 'border-white/20 bg-white text-[#2E568D]'
                                            : 'border-[#850E35]/10 bg-white text-[#850E35]'
                                    )}
                                >
                                    <Icon className="h-7 w-7" />
                                </div>

                                <div>
                                    <h3 className={cn('text-2xl font-medium leading-tight', isBlueMystic ? 'text-white' : 'text-[#850E35]')}>
                                        {item.title}
                                    </h3>
                                    {item.content ? (
                                        <p className={cn('mt-3 text-lg leading-8', isBlueMystic ? 'text-white/90' : 'text-[#3E2A2A]/80')}>
                                            {item.content}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
