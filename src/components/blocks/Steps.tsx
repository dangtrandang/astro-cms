import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import type { ButtonProps } from '@/components/blocks/Button';

interface StepItem {
    id: string;
    title?: string | null;
    content?: string | null;
    image?: string | null;
    sort?: number | null;
    button_group?: { id: string; buttons?: ButtonProps[] } | null;
}

interface StepsProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        show_step_numbers?: boolean | null;
        alternate_image_position?: boolean | null;
        steps?: StepItem[];
    };
}

export default function Steps({ data }: StepsProps) {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-7xl space-y-16">
                {data.headline && (
                    <div
                        className="text-center"
                        data-directus={setAttr({ collection: 'block_steps', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                <div className="space-y-16">
                    {data.steps?.map((step, i) => {
                        const imageLeft = data.alternate_image_position ? i % 2 === 0 : true;
                        return (
                            <div
                                key={step.id}
                                className={`flex flex-col gap-10 md:flex-row md:items-center ${imageLeft ? '' : 'md:flex-row-reverse'}`}
                            >
                                {step.image && (
                                    <div className="md:w-1/2">
                                        <img
                                            src={`${directusUrl}/assets/${step.image}`}
                                            alt={step.title || ''}
                                            className="w-full rounded-xl object-cover"
                                        />
                                    </div>
                                )}
                                <div className="space-y-4 md:w-1/2">
                                    {data.show_step_numbers && (
                                        <span className="text-5xl font-bold text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                                    )}
                                    {step.title && (
                                        <h3
                                            className="text-2xl font-semibold"
                                            data-directus={setAttr({ collection: 'block_step_items', item: step.id, fields: 'title', mode: 'popover' })}
                                        >
                                            {step.title}
                                        </h3>
                                    )}
                                    {step.content && (
                                        <div
                                            className="prose text-gray-600"
                                            data-directus={setAttr({ collection: 'block_step_items', item: step.id, fields: 'content', mode: 'drawer' })}
                                            dangerouslySetInnerHTML={{ __html: step.content }}
                                        />
                                    )}
                                    {step.button_group?.buttons?.length ? (
                                        <ButtonGroup buttons={step.button_group.buttons} />
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
