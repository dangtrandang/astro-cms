import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface Testimonial {
    id: string;
    name?: string | null;
    title?: string | null;
    company?: string | null;
    quote?: string | null;
    image?: string | null;
}

interface TestimonialsProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        testimonials?: Array<{ testimonials_id?: Testimonial | null }> | null;
    };
}

export default function Testimonials({ data }: TestimonialsProps) {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;
    const items = data.testimonials?.map((t) => t.testimonials_id).filter(Boolean) as Testimonial[];

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-7xl space-y-12">
                {data.headline && (
                    <div
                        className="text-center"
                        data-directus={setAttr({ collection: 'block_testimonials', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                {items?.length ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((t) => (
                            <div key={t.id} className="rounded-xl border border-gray-200 p-6 space-y-4">
                                {t.quote && <p className="text-gray-700 italic">"{t.quote}"</p>}
                                <div className="flex items-center gap-3">
                                    {t.image && (
                                        <img
                                            src={`${directusUrl}/assets/${t.image}?width=80&height=80&fit=cover`}
                                            alt={t.name || ''}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        {t.name && <p className="font-semibold text-sm text-gray-900">{t.name}</p>}
                                        {(t.title || t.company) && (
                                            <p className="text-xs text-gray-500">{[t.title, t.company].filter(Boolean).join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
