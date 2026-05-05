export type VisualEditingConfig = {
    collection: string;
    item: string | number;
    fields?: string[];
    mode?: 'modal' | 'popover' | 'drawer';
    [key: string]: unknown;
};

export function setVisualEditingAttr(editConfig: VisualEditingConfig): string {
    return JSON.stringify(editConfig);
}
