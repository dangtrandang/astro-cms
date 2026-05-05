import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import type { ButtonProps } from '@/components/blocks/Button';

interface CtaProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        content?: string | null;
        button_group?: {
            id: string;
            buttons?: ButtonProps[];
        } | null;
    };
}

export default function Cta({ data }: CtaProps) {
    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-3xl text-center space-y-6">
                {data.headline && (
                    <h2
                        className="text-3xl font-bold tracking-tight sm:text-4xl"
                        data-directus={setAttr({ collection: 'block_cta', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                {data.content && (
                    <div
                        className="text-lg text-gray-600"
                        data-directus={setAttr({ collection: 'block_cta', item: data.id, fields: 'content', mode: 'drawer' })}
                        dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                )}
                {data.button_group?.buttons?.length ? (
                    <div
                        data-directus={setAttr({ collection: 'block_button_group', item: data.button_group.id, fields: 'buttons', mode: 'modal' })}
                    >
                        <ButtonGroup buttons={data.button_group.buttons} className="justify-center" />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
