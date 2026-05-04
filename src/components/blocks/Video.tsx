import { setAttr } from '@directus/visual-editing';

interface VideoProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        type?: 'url' | 'file' | null;
        video_url?: string | null;
        video_file?: string | null;
    };
}

export default function Video({ data }: VideoProps) {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;
    const src = data.type === 'file' && data.video_file
        ? `${directusUrl}/assets/${data.video_file}`
        : data.video_url || null;

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-5xl space-y-8">
                {data.headline && (
                    <div
                        className="text-center"
                        data-directus={setAttr({ collection: 'block_video', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                {src && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                        {data.type === 'file' ? (
                            <video src={src} controls className="h-full w-full" />
                        ) : (
                            <iframe
                                src={src}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
