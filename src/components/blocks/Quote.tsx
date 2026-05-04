import { setAttr } from '@directus/visual-editing';

interface QuoteProps {
    data: {
        id: string;
        title?: string | null;
        subtitle?: string | null;
        content?: string | null;
    };
}

export default function Quote({ data }: QuoteProps) {
    return (
        <section className="py-20 px-6">
            <figure className="mx-auto max-w-3xl text-center space-y-6">
                {data.content && (
                    <blockquote
                        className="text-2xl font-medium leading-relaxed text-gray-900 before:content-['\u201c'] after:content-['\u201d']"
                        data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: 'content', mode: 'drawer' })}
                        dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                )}
                {(data.title || data.subtitle) && (
                    <figcaption className="space-y-1">
                        {data.title && (
                            <p
                                className="font-semibold text-gray-900"
                                data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: 'title', mode: 'popover' })}
                            >
                                {data.title}
                            </p>
                        )}
                        {data.subtitle && (
                            <p
                                className="text-sm text-gray-500"
                                data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: 'subtitle', mode: 'popover' })}
                            >
                                {data.subtitle}
                            </p>
                        )}
                    </figcaption>
                )}
            </figure>
        </section>
    );
}
