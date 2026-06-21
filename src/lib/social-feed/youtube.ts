export interface SocialItem {
  title: string;
  url: string;
  videoId: string;
  thumbnail: string;
  publishedAt: string;
  isShort: boolean;
  views: number;
}

const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCyPpIoGDGUsSIArIlGi4a0Q';
const RSS_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCyPpIoGDGUsSIArIlGi4a0Q';

export async function fetchYouTubeVideos(limit = 6): Promise<SocialItem[]> {
  const response = await fetch(RSS_URL);
  const xml = await response.text();

  const entries = xml.split('<entry>').slice(1);
  const items: SocialItem[] = [];

  for (let i = 0; i < Math.min(entries.length, limit); i++) {
    const entry = entries[i];

    const videoId = extract(entry, '<yt:videoId>', '</yt:videoId>');
    const title = decodeEntities(extract(entry, '<media:title>', '</media:title>') || extract(entry, '<title>', '</title>'));
    const publishedAt = extract(entry, '<published>', '</published>');
    const thumbnail = extract(entry, '<media:thumbnail', '/>')?.match(/url="([^"]+)"/)?.[1] || '';
    const linkHref = extract(entry, '<link rel="alternate"', '/>')?.match(/href="([^"]+)"/)?.[1] || '';

    const isShort = linkHref.includes('/shorts/');
    const url = linkHref || (isShort
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`);

    const viewsMatch = entry.match(/<media:statistics\s+views="(\d+)"/);
    const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

    if (videoId && title) {
      items.push({ title, url, videoId, thumbnail, publishedAt, isShort, views });
    }
  }

  return items;
}

function extract(text: string, start: string, end: string): string {
  const s = text.indexOf(start);
  if (s === -1) return '';
  const startIdx = s + start.length;
  const endIdx = text.indexOf(end, startIdx);
  if (endIdx === -1) return text.slice(startIdx).trim();
  return text.slice(startIdx, endIdx).trim();
}

function decodeEntities(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}
