import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

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
        <section className="relative overflow-hidden bg-[#FCF5EE] px-6 py-20 sm:px-8 lg:px-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F2D1D1]/70 via-transparent to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-[#C6DCE4]/30 blur-3xl" />

            <figure className="relative mx-auto max-w-4xl rounded-[32px] border border-[#850E35]/10 bg-white/65 px-8 py-12 text-center shadow-[0_10px_30px_rgba(133,14,53,0.08)] backdrop-blur-sm sm:px-12 sm:py-16 lg:px-16">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#850E35]/15 bg-[#F2D1D1]/60 text-4xl leading-none text-[#850E35] shadow-[0_10px_25px_rgba(133,14,53,0.08)]">
                    “
                </div>

                {data.title && (
                    <p
                        className="mt-8 text-xs uppercase tracking-[0.32em] text-[#850E35]/70"
                        data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: ['title'], mode: 'popover' })}
                    >
                        {data.title}
                    </p>
                )}

                {data.content && (
                    <blockquote
                        className="mx-auto mt-6 max-w-3xl font-serif-display text-3xl leading-[1.45] tracking-[-0.02em] text-[#3E2A2A] sm:text-4xl"
                        data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: ['content'], mode: 'drawer' })}
                        dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                )}

                {data.subtitle && (
                    <figcaption className="mt-8 flex flex-col items-center gap-3">
                        <span className="h-px w-20 bg-gradient-to-r from-transparent via-[#850E35]/35 to-transparent" />
                        <p
                            className="text-sm font-medium tracking-[0.18em] text-[#850E35]/70"
                            data-directus={setAttr({ collection: 'block_quote', item: data.id, fields: ['subtitle'], mode: 'popover' })}
                        >
                            {data.subtitle}
                        </p>
                    </figcaption>
                )}
            </figure>
        </section>
    );
}
