interface DividerProps {
    data: {
        id: string;
        title?: string | null;
    };
}

export default function Divider({ data }: DividerProps) {
    return (
        <div className="py-8 px-6">
            <hr className="border-gray-200" />
        </div>
    );
}
