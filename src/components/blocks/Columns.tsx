import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';
import ButtonGroup from '@/components/blocks/ButtonGroup';
import type { ButtonProps } from '@/components/blocks/Button';

interface ColumnRow {
    id: string;
    title?: string | null;
    headline?: string | null;
    content?: string | null;
    image?: string | null;
    image_position?: 'left' | 'right' | null;
    button_group?: { id: string; buttons?: ButtonProps[] } | null;
}

interface ColumnsProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        rows?: ColumnRow[];
    };
}

export default function Columns({ data }: ColumnsProps) {
    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-7xl space-y-16">
                {data.headline && (
                    <div
                        className="text-center"
                        data-directus={setAttr({ collection: 'block_columns', item: data.id, fields: 'headline', mode: 'popover' })}
                        dangerouslySetInnerHTML={{ __html: data.headline }}
                    />
                )}
                {data.rows?.map((row) => {
                    const imageLeft = row.image_position !== 'right';
                    return (
                        <div
                            key={row.id}
                            className={`flex flex-col gap-10 md:flex-row md:items-center ${imageLeft ? '' : 'md:flex-row-reverse'}`}
                        >
                            {row.image && (
                                <div className="md:w-1/2">
                                    <img
                                        src={`${import.meta.env.PUBLIC_DIRECTUS_URL}/assets/${row.image}`}
                                        alt={row.title || ''}
                                        className="w-full rounded-xl object-cover"
                                    />
                                </div>
                            )}
                            <div className="space-y-4 md:w-1/2">
                                {row.headline && (
                                    <h3
                                        className="text-2xl font-semibold"
                                        data-directus={setAttr({ collection: 'block_columns_rows', item: row.id, fields: 'headline', mode: 'popover' })}
                                    >
                                        {row.headline}
                                    </h3>
                                )}
                                {row.content && (
                                    <div
                                        className="prose text-gray-600"
                                        data-directus={setAttr({ collection: 'block_columns_rows', item: row.id, fields: 'content', mode: 'drawer' })}
                                        dangerouslySetInnerHTML={{ __html: row.content }}
                                    />
                                )}
                                {row.button_group?.buttons?.length ? (
                                    <ButtonGroup buttons={row.button_group.buttons} />
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
