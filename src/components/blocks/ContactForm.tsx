import FormBuilder from '@/components/forms/FormBuilder';
import DirectusImage from '@/components/shared/DirectusImage';
import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface FormImage {
    directus_files_id: {
        id: string;
        title?: string | null;
        description?: string | null;
    };
}

interface ContactFormBlockProps {
    data: {
        id: string;
        title: string | null;
        headline: string | null;
        form: {
            id: string;
            on_success?: 'redirect' | 'message' | null;
            sort?: number | null;
            submit_label?: string;
            success_message?: string | null;
            title?: string | null;
            success_redirect_url?: string | null;
            is_active?: boolean | null;
            fields?: any[];
            schema?: any[];
        } | null;
        image?: FormImage[] | null;
    };
}

export default function ContactForm({ data }: ContactFormBlockProps) {
    const { id, title, headline, form, image } = data;

    if (!form) {
        return null;
    }

    // Remap API schema to fields that FormBuilder expects
    const formForBuilder = {
        ...form,
        is_active: true,
        fields: form.fields || form.schema || [],
    };

    const firstImage = (image || [])[0]?.directus_files_id?.id;

    return (
        <section className="bg-cream py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {(headline || title) && (
                    <div className="mb-12 text-center">
                        {title && (
                            <h2
                                className="font-heading text-4xl font-semibold italic text-charcoal md:text-5xl"
                                style={{
                                    fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                                    lineHeight: '1.15',
                                }}
                                data-directus={setAttr({
                                    collection: 'block_form',
                                    item: id,
                                    fields: ['title'],
                                    mode: 'popover',
                                })}
                            >
                                {title}
                            </h2>
                        )}
                        {headline && (
                            <p
                                className="mt-3 font-body text-lg text-charcoal/70"
                                dangerouslySetInnerHTML={{ __html: headline }}
                                suppressHydrationWarning
                                data-directus={setAttr({
                                    collection: 'block_form',
                                    item: id,
                                    fields: ['headline'],
                                    mode: 'popover',
                                })}
                            />
                        )}
                    </div>
                )}

                <div className="flex flex-col items-stretch gap-12 lg:flex-row lg:gap-16">
                    {/* Left Column — Form (60%) */}
                    <div className="lg:w-3/5">
                        <FormBuilder
                            form={formForBuilder}
                            submitVariant="custom"
                            submitClassName="rounded-xl bg-dusty-blue px-8 py-3 font-medium text-cream transition-all duration-300 hover:bg-charcoal hover:shadow-[0_0_20px_rgba(45,42,40,0.18)]"
                        />
                    </div>

                    {/* Right Column — Single floating image (40%) */}
                    <div className="flex items-center justify-center lg:w-2/5">
                        {firstImage && (
                            <div className="animate-float w-full max-w-md rounded-2xl">
                                <DirectusImage uuid={firstImage} className="h-auto w-full rounded-2xl" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
