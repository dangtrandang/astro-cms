// HTML entity decoder for Vietnamese + common entities
// Dùng character codes thay vì entity literal để tránh lỗi encode/decode

const ENTITY_MAP: Record<string, string> = {};

function buildMap(): void {
    const pairs: Array<[string, string]> = [
        ['amp', '\x26'],
        ['lt', '\x3C'],
        ['gt', '\x3E'],
        ['quot', '\x22'],
        ['apos', '\x27'],
        ['nbsp', '\x20'],
        ['eacute', '\xE9'],
        ['egrave', '\xE8'],
        ['ecirc', '\xEA'],
        ['aacute', '\xE1'],
        ['agrave', '\xE0'],
        ['acirc', '\xE2'],
        ['atilde', '\xE3'],
        ['iacute', '\xED'],
        ['igrave', '\xEC'],
        ['oacute', '\xF3'],
        ['ograve', '\xF2'],
        ['ocirc', '\xF4'],
        ['otilde', '\xF5'],
        ['uacute', '\xFA'],
        ['ugrave', '\xF9'],
        ['yacute', '\xFD'],
        ['Eacute', '\xC9'],
        ['Egrave', '\xC8'],
        ['Ecirc', '\xCA'],
        ['Aacute', '\xC1'],
        ['Agrave', '\xC0'],
        ['Acirc', '\xC2'],
        ['Atilde', '\xC3'],
        ['Iacute', '\xCD'],
        ['Oacute', '\xD3'],
        ['Ograve', '\xD2'],
        ['Ocirc', '\xD4'],
        ['Otilde', '\xD5'],
        ['Uacute', '\xDA'],
        ['Yacute', '\xDD'],
        ['dacute', '\u0111'],
        ['Dacute', '\u0110'],
        ['iexcl', '\xA1'],
        ['iquest', '\xBF'],
        ['laquo', '\xAB'],
        ['raquo', '\xBB'],
        ['mdash', '\u2014'],
        ['ndash', '\u2013'],
        ['lsquo', '\u2018'],
        ['rsquo', '\u2019'],
        ['ldquo', '\u201C'],
        ['rdquo', '\u201D'],
        ['hellip', '\u2026'],
    ];
    for (const [entity, char] of pairs) {
        ENTITY_MAP['&' + entity + ';'] = char;
    }
}
buildMap();

export function decodeHtmlEntities(html: string): string {
    // Browser: dùng DOM parser để decode toàn bộ entities
    if (typeof document !== 'undefined') {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }
    // SSR fallback: manual decode common entities
    return html.replace(/&[#0-9a-z]+;/gi, (entity) => {
        const lower = entity.toLowerCase();
        if (ENTITY_MAP[lower]) return ENTITY_MAP[lower];
        if (ENTITY_MAP[entity]) return ENTITY_MAP[entity];
        const hexMatch = entity.match(/^&#x([0-9a-f]+);$/i);
        if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16));
        const decMatch = entity.match(/^&#(\d+);$/);
        if (decMatch) return String.fromCodePoint(parseInt(decMatch[1], 10));
        return entity;
    });
}
