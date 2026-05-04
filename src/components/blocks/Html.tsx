interface HtmlProps {
    data: {
        id: string;
        raw_html?: string | null;
    };
}

export default function Html({ data }: HtmlProps) {
    if (!data.raw_html) return null;
    return (
        <div dangerouslySetInnerHTML={{ __html: data.raw_html }} />
    );
}
