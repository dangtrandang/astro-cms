import { setVisualEditingAttr as setAttr } from '@/lib/visualEditing';

interface TeamMember {
    id: string;
    name?: string | null;
    title?: string | null;
    image?: string | null;
    bio?: string | null;
}

interface TeamProps {
    data: {
        id: string;
        title?: string | null;
        headline?: string | null;
        content?: string | null;
        team_members?: TeamMember[];
    };
}

export default function Team({ data }: TeamProps) {
    const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL;

    return (
        <section className="py-20 px-6">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="text-center space-y-4">
                    {data.headline && (
                        <div
                            data-directus={setAttr({ collection: 'block_team', item: data.id, fields: 'headline', mode: 'popover' })}
                            dangerouslySetInnerHTML={{ __html: data.headline }}
                        />
                    )}
                    {data.content && (
                        <div
                            className="text-gray-600"
                            data-directus={setAttr({ collection: 'block_team', item: data.id, fields: 'content', mode: 'drawer' })}
                            dangerouslySetInnerHTML={{ __html: data.content }}
                        />
                    )}
                </div>
                {data.team_members?.length ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {data.team_members.map((member) => (
                            <div key={member.id} className="text-center space-y-3">
                                {member.image && (
                                    <img
                                        src={`${directusUrl}/assets/${member.image}?width=300&height=300&fit=cover`}
                                        alt={member.name || ''}
                                        className="mx-auto h-32 w-32 rounded-full object-cover"
                                    />
                                )}
                                {member.name && <p className="font-semibold text-gray-900">{member.name}</p>}
                                {member.title && <p className="text-sm text-gray-500">{member.title}</p>}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
