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
        <section className="bg-[#FCF5EE] py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {(headline || title) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2
                                className="font-normal text-4xl md:text-5xl"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    color: '#850E35',
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
                                className="mt-3 text-lg text-gray-600 font-body"
                                dangerouslySetInnerHTML={{ __html: headline }}
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

                <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
                    {/* Left Column — Form (60%) */}
                    <div className="lg:w-3/5">
                        <FormBuilder
                            form={formForBuilder}
                            submitVariant="custom"
                            submitClassName="bg-[#850E35] text-[#FCF5EE] rounded-xl px-8 py-3 font-medium hover:bg-[#6b0b2a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(133,14,53,0.3)]"
                        />
                    </div>

                    {/* Right Column — Single floating image (40%) */}
                    <div className="lg:w-2/5 flex items-center justify-center">
                        {firstImage && (
                            <div
                                className="w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden animate-float"
                                style={{
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                                }}
                            >
                                <DirectusImage uuid={firstImage} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
