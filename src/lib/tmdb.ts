const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const tmdbImageUrl = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", process.env.NEXT_PUBLIC_TMDB_API_KEY!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);
  return res.json();
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
}

export interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  credits?: { cast: TMDBCast[] };
  videos?: { results: TMDBVideo[] };
}

export async function getTrendingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/trending/movie/week`, { page: String(page) });
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/movie/popular`, { page: String(page) });
}

export async function getTopRatedMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/movie/top_rated`, { page: String(page) });
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  return tmdbFetch(`/movie/${id}`, {
    append_to_response: "credits,videos",
  });
}

export async function searchMovies(query: string, page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/search/movie`, { query, page: String(page) });
}

export function getOfficialTrailer(videos: TMDBVideo[]): TMDBVideo | null {
  const trailer = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  );
  return (
    trailer ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube") ||
    null
  );
}
