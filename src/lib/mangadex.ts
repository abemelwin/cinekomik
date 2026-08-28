const MANGADEX_BASE = "https://api.mangadex.org";
const MANGADEX_UPLOADS = "https://uploads.mangadex.org";

async function mangadexFetch<T>(
  endpoint: string,
  params: Record<string, string | string[]> = {}
): Promise<T> {
  const url = new URL(`${MANGADEX_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((item) => url.searchParams.append(k, item));
    } else {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "CineKomik/1.0" },
  });

  if (!res.ok) throw new Error(`MangaDex fetch failed: ${res.status}`);
  return res.json();
}

export interface MangaDexTag {
  id: string;
  type: string;
  attributes: { name: { en?: string }; group: string };
}

export interface MangaDexRelationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: { en?: string; [key: string]: string | undefined };
    altTitles: { [key: string]: string }[];
    description: { en?: string; [key: string]: string | undefined };
    status: string;
    year: number | null;
    contentRating: string;
    tags: MangaDexTag[];
    lastChapter: string | null;
    latestUploadedChapter: string | null;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexChapter {
  id: string;
  type: string;
  attributes: {
    title: string | null;
    volume: string | null;
    chapter: string | null;
    pages: number;
    translatedLanguage: string;
    publishAt: string;
    externalUrl: string | null;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexResponse<T> {
  result: string;
  response: string;
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

export interface MangaDexSingleResponse<T> {
  result: string;
  response: string;
  data: T;
}

export function getMangaTitle(manga: MangaDexManga): string {
  return (
    manga.attributes.title.en ||
    Object.values(manga.attributes.title)[0] ||
    "Unknown Title"
  );
}

export function getMangaDescription(manga: MangaDexManga): string {
  return manga.attributes.description.en || "No description available.";
}

export function getMangaCoverUrl(manga: MangaDexManga, size: "256" | "512" | "" = "512"): string {
  const coverRel = manga.relationships.find((r) => r.type === "cover_art");
  if (!coverRel?.attributes) return "/placeholder-manga.jpg";
  const fileName = (coverRel.attributes as { fileName?: string }).fileName;
  if (!fileName) return "/placeholder-manga.jpg";
  const suffix = size ? `.${size}.jpg` : "";
  return `${MANGADEX_UPLOADS}/covers/${manga.id}/${fileName}${suffix}`;
}

export function getMangaTags(manga: MangaDexManga): string[] {
  return manga.attributes.tags
    .filter((t) => t.attributes.group === "genre")
    .map((t) => t.attributes.name.en || "")
    .filter(Boolean)
    .slice(0, 4);
}

export async function getPopularManga(limit = 20, offset = 0): Promise<MangaDexResponse<MangaDexManga>> {
  return mangadexFetch("/manga", {
    limit: String(limit),
    offset: String(offset),
    "order[followedCount]": "desc",
    "includes[]": ["cover_art", "author"],
    availableTranslatedLanguage: "en",
    contentRating: ["safe", "suggestive"],
  });
}

export async function getLatestManga(limit = 20, offset = 0): Promise<MangaDexResponse<MangaDexManga>> {
  return mangadexFetch("/manga", {
    limit: String(limit),
    offset: String(offset),
    "order[latestUploadedChapter]": "desc",
    "includes[]": ["cover_art", "author"],
    availableTranslatedLanguage: "en",
    contentRating: ["safe", "suggestive"],
  });
}

export async function getMangaById(id: string): Promise<MangaDexSingleResponse<MangaDexManga>> {
  return mangadexFetch(`/manga/${id}`, {
    "includes[]": ["cover_art", "author", "artist"],
  });
}

export async function getMangaChapters(
  mangaId: string,
  limit = 100,
  offset = 0
): Promise<MangaDexResponse<MangaDexChapter>> {
  return mangadexFetch(`/manga/${mangaId}/feed`, {
    limit: String(limit),
    offset: String(offset),
    translatedLanguage: "en",
    "order[chapter]": "asc",
    "order[volume]": "asc",
    contentRating: ["safe", "suggestive"],
  });
}

export async function getChapterPages(chapterId: string): Promise<{
  baseUrl: string;
  chapter: { hash: string; data: string[]; dataSaver: string[] };
}> {
  const res = await fetch(`${MANGADEX_BASE}/at-home/server/${chapterId}`, {
    headers: { "User-Agent": "CineKomik/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch chapter pages: ${res.status}`);
  return res.json();
}

export async function searchManga(query: string, limit = 20): Promise<MangaDexResponse<MangaDexManga>> {
  return mangadexFetch("/manga", {
    title: query,
    limit: String(limit),
    "includes[]": ["cover_art"],
    availableTranslatedLanguage: "en",
    contentRating: ["safe", "suggestive"],
  });
}
