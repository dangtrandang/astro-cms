import { setAttr } from '@directus/visual-editing';

interface LogoCloudProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        logos?: Array<{ id: string; directus_files_id?: string | null }> | null;
    };
}

export default function LogoCloud({ data }: LogoCloudProps) {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

    return (
        <section className="py-16 px-6">
            <div className="mx-auto max-w-7xl space-y-10">
                {data.headline && (
                    <div
                        className="text-center"
                        data-directus={setAttr({ collection: 'block_logocloud', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                {data.logos?.length ? (
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {data.logos.map((logo) =>
                            logo.directus_files_id ? (
                                <img
                                    key={logo.id}
                                    src={`${directusUrl}/assets/${logo.directus_files_id}`}
                                    alt=""
                                    className="h-10 w-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                                />
                            ) : null
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
