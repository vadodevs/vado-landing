export type GiphyMediaItem = {
  id: string;
  title: string;
  previewUrl: string;
  sendUrl: string;
  width: number;
  height: number;
};

type GiphyImageSet = {
  url?: string;
  width?: string;
  height?: string;
};

type GiphyItem = {
  id: string;
  title?: string;
  images?: Record<string, GiphyImageSet | undefined>;
};

function pickImage(images: Record<string, GiphyImageSet | undefined> | undefined): GiphyImageSet | null {
  if (!images) return null;
  return (
    images.fixed_height_small ??
    images.fixed_height ??
    images.downsized_medium ??
    images.downsized ??
    images.preview_gif ??
    images.original ??
    null
  );
}

function mapGiphyItem(item: GiphyItem): GiphyMediaItem | null {
  const preview = pickImage(item.images);
  const send =
    item.images?.original?.url ??
    item.images?.downsized_medium?.url ??
    item.images?.downsized?.url ??
    preview?.url;
  if (!send || !preview?.url) return null;
  return {
    id: item.id,
    title: item.title?.trim() || item.id,
    previewUrl: preview.url,
    sendUrl: send,
    width: Number(preview.width) || 200,
    height: Number(preview.height) || 200,
  };
}


const FALLBACK_GIFS: GiphyMediaItem[] = [
  {
    id: 'fb-thumbs-up',
    title: 'Thumbs up',
    previewUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    sendUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    width: 200,
    height: 200,
  },
  {
    id: 'fb-ok',
    title: 'OK',
    previewUrl: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    sendUrl: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    width: 200,
    height: 200,
  },
  {
    id: 'fb-clap',
    title: 'Clap',
    previewUrl: 'https://media.giphy.com/media/7rj2ZgTvgovYDJTuEO/giphy.gif',
    sendUrl: 'https://media.giphy.com/media/7rj2ZgTvgovYDJTuEO/giphy.gif',
    width: 200,
    height: 200,
  },
  {
    id: 'fb-wave',
    title: 'Wave',
    previewUrl: 'https://media.giphy.com/media/26BRuo6sGiljlHw4w/giphy.gif',
    sendUrl: 'https://media.giphy.com/media/26BRuo6sGiljlHw4w/giphy.gif',
    width: 200,
    height: 200,
  },
];

const FALLBACK_STICKERS: GiphyMediaItem[] = [
  {
    id: 'fb-sticker-hi',
    title: 'Hi',
    previewUrl: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.webp',
    sendUrl: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.webp',
    width: 200,
    height: 200,
  },
  {
    id: 'fb-sticker-yes',
    title: 'Yes',
    previewUrl: 'https://media.giphy.com/media/3o7btY6fNbW7VczZjW/giphy.webp',
    sendUrl: 'https://media.giphy.com/media/3o7btY6fNbW7VczZjW/giphy.webp',
    width: 200,
    height: 200,
  },
  {
    id: 'fb-sticker-heart',
    title: 'Heart',
    previewUrl: 'https://media.giphy.com/media/3o7TKsQ8MJHyTASOry/giphy.webp',
    sendUrl: 'https://media.giphy.com/media/3o7TKsQ8MJHyTASOry/giphy.webp',
    width: 200,
    height: 200,
  },
];

export function getGiphyApiKey(): string {
  const key = import.meta.env.VITE_GIPHY_API_KEY;
  return typeof key === 'string' ? key.trim() : '';
}

export function getFallbackGifs(): GiphyMediaItem[] {
  return FALLBACK_GIFS;
}

export function getFallbackStickers(): GiphyMediaItem[] {
  return FALLBACK_STICKERS;
}

async function giphyFetch(path: string, params: Record<string, string>): Promise<GiphyMediaItem[]> {
  const apiKey = getGiphyApiKey();
  if (!apiKey) return [];

  const q = new URLSearchParams({ api_key: apiKey, rating: 'pg', limit: '24', ...params });
  const res = await fetch(`https://api.giphy.com/v1/${path}?${q}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: GiphyItem[] };
  const rows = Array.isArray(json.data) ? json.data : [];
  return rows.map(mapGiphyItem).filter((x): x is GiphyMediaItem => x !== null);
}

export function fetchTrendingGifs(): Promise<GiphyMediaItem[]> {
  return giphyFetch('gifs/trending', {});
}

export function searchGifs(query: string): Promise<GiphyMediaItem[]> {
  const q = query.trim();
  if (!q) return fetchTrendingGifs();
  return giphyFetch('gifs/search', { q });
}

export function fetchTrendingStickers(): Promise<GiphyMediaItem[]> {
  return giphyFetch('stickers/trending', {});
}

export function searchStickers(query: string): Promise<GiphyMediaItem[]> {
  const q = query.trim();
  if (!q) return fetchTrendingStickers();
  return giphyFetch('stickers/search', { q });
}


export async function fetchRemoteImageAsFile(
  url: string,
  fallbackMime = 'image/gif',
): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status}`);
  }
  const blob = await res.blob();
  const mime = blob.type && blob.type.startsWith('image/') ? blob.type : fallbackMime;
  const ext = mime.includes('gif') ? 'gif' : mime.includes('webp') ? 'webp' : 'png';
  return new File([blob], `media.${ext}`, { type: mime });
}
