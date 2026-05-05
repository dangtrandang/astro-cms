import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import { useState } from 'react';

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqsProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        faqs?: FaqItem[] | null;
        alignment?: 'left' | 'center' | null;
    };
}

export default function Faqs({ data }: FaqsProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const align = data.alignment === 'center' ? 'text-center' : 'text-left';

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-3xl space-y-10">
                {data.headline && (
                    <div
                        className={align}
                        data-directus={setAttr({ collection: 'block_faqs', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                <div className="divide-y divide-gray-200">
                    {data.faqs?.map((faq, i) => (
                        <div key={i} className="py-4">
                            <button
                                className="flex w-full items-center justify-between text-left font-medium text-gray-900"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                <span>{faq.question}</span>
                                <span className="ml-4 text-xl">{openIndex === i ? '−' : '+'}</span>
                            </button>
                            {openIndex === i && (
                                <p className="mt-3 text-gray-600">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
