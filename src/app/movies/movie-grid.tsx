import Link from "next/link";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  searchMovies,
} from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieSearch } from "./movie-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
];

interface MovieGridProps {
  tab: string;
  page: number;
  query: string;
}

export async function MovieGrid({ tab, page, query }: MovieGridProps) {
  let movies: Awaited<ReturnType<typeof getTrendingMovies>>["results"] = [];
  let totalPages = 1;

  try {
    if (query) {
      const data = await searchMovies(query, page);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 20);
    } else if (tab === "popular") {
      const data = await getPopularMovies(page);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 20);
    } else if (tab === "top_rated") {
      const data = await getTopRatedMovies(page);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 20);
    } else {
      const data = await getTrendingMovies(page);
      movies = data.results;
      totalPages = Math.min(data.total_pages, 20);
    }
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-muted-foreground mb-2">Failed to load movies.</p>
        <p className="text-sm text-muted-foreground">
          Make sure your TMDB API key is set in .env.local
        </p>
      </div>
    );
  }

  const buildUrl = (newTab?: string, newPage?: number, newQuery?: string) => {
    const params = new URLSearchParams();
    if (newTab && newTab !== "trending") params.set("tab", newTab);
    if (newPage && newPage > 1) params.set("page", String(newPage));
    if (newQuery) params.set("q", newQuery);
    const qs = params.toString();
    return `/movies${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <MovieSearch initialQuery={query} />

      {/* Tab switcher — only show if no search query */}
      {!query && (
        <div className="flex gap-2 border-b border-border pb-4">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={buildUrl(t.id, 1)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {/* Results count when searching */}
      {query && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing results for <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
          </p>
          <Link href="/movies" className="text-sm text-primary hover:underline">
            Clear search
          </Link>
        </div>
      )}

      {/* Grid */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg font-medium mb-1">No movies found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page - 1, query)}>← Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page + 1, query)}>Next →</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
