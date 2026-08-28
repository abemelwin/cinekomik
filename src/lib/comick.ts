const COMICK_API = "https://api.comick.io";
const COMICK_IMAGE = "https://meo.comick.pictures";

async function comickFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${COMICK_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: {
      "User-Agent": "CineKomik/1.0",
      Referer: "https://comick.io/",
    },
  });

  if (!res.ok) throw new Error(`Comick fetch failed: ${res.status} ${path}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComickCover {
  w: number;
  h: number;
  b2key: string;
  vol?: string;
}

export interface ComickComic {
  id: number;
  hid: string;
  slug: string;
  title: string;
  country: string;
  status: number; // 1=ongoing 2=completed 3=cancelled 4=hiatus
  links?: Record<string, string>;
  last_chapter: number | null;
  chapter_count?: number;
  follow_count?: number;
  demographic?: number;
  content_rating?: string;
  desc?: string;
  md_covers?: ComickCover[];
  md_titles?: { title: string; lang?: string }[];
  genres?: { name: string }[];
  md_comic_md_genres?: { md_genres: { name: string; slug: string } }[];
  authors?: { name: string; slug: string }[];
  artists?: { name: string; slug: string }[];
}

export interface ComickSearchResult {
  hid: string;
  slug: string;
  title: string;
  country: string;
  status: number;
  last_chapter: number | null;
  follow_count?: number;
  content_rating?: string;
  md_covers?: ComickCover[];
  md_titles?: { title: string; lang?: string }[];
  genres?: { name: string }[];
}

export interface ComickChapter {
  id: number;
  hid: string;
  chap: string | null;
  title: string | null;
  vol: string | null;
  lang: string;
  created_at: string;
  updated_at: string;
  up_count: number;
  down_count: number;
  group_name: string[];
}

export interface ComickChaptersResponse {
  chapters: ComickChapter[];
  total: number;
}

export interface ComickChapterPage {
  name: string;
  s3key?: string;
  b2key?: string;
  w: number;
  h: number;
}

export interface ComickChapterResponse {
  chapter: {
    hid: string;
    chap: string | null;
    title: string | null;
    md_images: ComickChapterPage[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getComickCoverUrl(comic: ComickSearchResult | ComickComic): string {
  const cover = comic.md_covers?.[0];
  if (!cover?.b2key) return "/placeholder-manga.jpg";
  return `${COMICK_IMAGE}/${cover.b2key}`;
}

export function getComickStatus(status: number): string {
  const map: Record<number, string> = {
    1: "ongoing",
    2: "completed",
    3: "cancelled",
    4: "hiatus",
  };
  return map[status] ?? "unknown";
}

export function getComickGenres(comic: ComickComic): string[] {
  if (comic.md_comic_md_genres?.length) {
    return comic.md_comic_md_genres
      .map((g) => g.md_genres?.name)
      .filter(Boolean)
      .slice(0, 4) as string[];
  }
  if (comic.genres?.length) {
    return comic.genres.map((g) => g.name).slice(0, 4);
  }
  return [];
}

export function getComickPageUrl(page: ComickChapterPage): string {
  const key = page.b2key || page.s3key || page.name;
  return `${COMICK_IMAGE}/${key}`;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Trending / popular comics */
export async function getComickPopular(
  page = 1,
  limit = 20
): Promise<ComickSearchResult[]> {
  const data = await comickFetch<ComickSearchResult[]>("/v1.0/search", {
    sort: "follow",
    page: String(page),
    limit: String(limit),
    lang: "en",
    "content-rating[]": "safe",
  });
  return data;
}

/** Latest updated comics */
export async function getComickLatest(
  page = 1,
  limit = 20
): Promise<ComickSearchResult[]> {
  const data = await comickFetch<ComickSearchResult[]>("/v1.0/search", {
    sort: "uploaded",
    page: String(page),
    limit: String(limit),
    lang: "en",
    "content-rating[]": "safe",
  });
  return data;
}

/** Top rated comics */
export async function getComickTopRated(
  page = 1,
  limit = 20
): Promise<ComickSearchResult[]> {
  const data = await comickFetch<ComickSearchResult[]>("/v1.0/search", {
    sort: "rating",
    page: String(page),
    limit: String(limit),
    lang: "en",
    "content-rating[]": "safe",
  });
  return data;
}

/** Search comics by title */
export async function searchComick(
  query: string,
  limit = 20
): Promise<ComickSearchResult[]> {
  const data = await comickFetch<ComickSearchResult[]>("/v1.0/search", {
    q: query,
    limit: String(limit),
    lang: "en",
  });
  return data;
}

/** Get full comic details by slug */
export async function getComickComic(slug: string): Promise<{ comic: ComickComic }> {
  return comickFetch(`/comic/${slug}`);
}

/** Get chapters for a comic by hid */
export async function getComickChapters(
  hid: string,
  limit = 100,
  page = 1
): Promise<ComickChaptersResponse> {
  return comickFetch(`/comic/${hid}/chapters`, {
    lang: "en",
    limit: String(limit),
    page: String(page),
  });
}

/** Get pages for a chapter by hid */
export async function getComickChapterPages(
  hid: string
): Promise<ComickChapterResponse> {
  return comickFetch(`/chapter/${hid}`);
}
