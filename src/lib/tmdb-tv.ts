const TMDB_BASE = "https://api.themoviedb.org/3";
export const tmdbImageUrl = (path: string | null, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", process.env.NEXT_PUBLIC_TMDB_API_KEY!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB TV fetch failed: ${res.status}`);
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  origin_country?: string[];
  original_language?: string;
}

export interface TMDBTVResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episodes: TMDBEpisode[];
  poster_path: string | null;
}

export interface TMDBTVDetails extends TMDBTVShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TMDBSeason[];
  networks: { id: number; name: string; logo_path: string | null }[];
  status: string;
  tagline: string;
  episode_run_time: number[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  videos?: { results: { key: string; site: string; type: string; official: boolean }[] };
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[] };
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function getTrendingTV(page = 1): Promise<TMDBTVResponse<TMDBTVShow>> {
  return tmdbFetch("/trending/tv/week", { page: String(page) });
}

export async function getPopularTV(page = 1): Promise<TMDBTVResponse<TMDBTVShow>> {
  return tmdbFetch("/tv/popular", { page: String(page) });
}

export async function getTopRatedTV(page = 1): Promise<TMDBTVResponse<TMDBTVShow>> {
  return tmdbFetch("/tv/top_rated", { page: String(page) });
}

/** K-Drama: Korean language TV shows sorted by popularity */
export async function getKDramas(page = 1): Promise<TMDBTVResponse<TMDBTVShow>> {
  return tmdbFetch("/discover/tv", {
    page: String(page),
    with_original_language: "ko",
    sort_by: "popularity.desc",
    "vote_count.gte": "50",
  });
}

export async function searchTV(query: string, page = 1): Promise<TMDBTVResponse<TMDBTVShow>> {
  return tmdbFetch("/search/tv", { query, page: String(page) });
}

export async function getTVDetails(id: number): Promise<TMDBTVDetails> {
  return tmdbFetch(`/tv/${id}`, {
    append_to_response: "credits,videos",
  });
}

export async function getTVSeason(
  tvId: number,
  seasonNumber: number
): Promise<TMDBSeasonDetails> {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}
