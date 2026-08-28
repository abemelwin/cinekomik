import Link from "next/link";
import Image from "next/image";
import { Film, BookOpen, Star, Play, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrendingMovies, tmdbImageUrl } from "@/lib/tmdb";
import { getPopularManga, getMangaCoverUrl, getMangaTitle } from "@/lib/mangadex";
import { getKDramas, tmdbImageUrl as tvImageUrl } from "@/lib/tmdb-tv";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured content for homepage
  let trendingMovies: Awaited<ReturnType<typeof getTrendingMovies>>["results"] = [];
  let popularManga: Awaited<ReturnType<typeof getPopularManga>>["data"] = [];
  let kdramas: Awaited<ReturnType<typeof getKDramas>>["results"] = [];

  try {
    const [moviesData, mangaData, kdramaData] = await Promise.all([
      getTrendingMovies(),
      getPopularManga(6),
      getKDramas(1),
    ]);
    trendingMovies = moviesData.results.slice(0, 5);
    popularManga = mangaData.data.slice(0, 6);
    kdramas = kdramaData.results.slice(0, 6);
  } catch {
    // Show empty state if APIs fail during build
  }

  const featured = trendingMovies[0];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {featured?.backdrop_path ? (
          <Image
            src={tmdbImageUrl(featured.backdrop_path, "original") || ""}
            alt={featured.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-background" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pb-16 pt-8">
          {featured ? (
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary px-2 py-1 bg-primary/20 rounded-full">
                  Trending Now
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-3 leading-tight">
                {featured.title}
              </h1>
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {featured.vote_average.toFixed(1)}
                </span>
                <span>·</span>
                <span>{new Date(featured.release_date).getFullYear()}</span>
              </div>
              <p className="text-muted-foreground mb-6 line-clamp-3 max-w-xl">
                {featured.overview}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild size="lg">
                  <Link href={`/movies/${featured.id}`}>
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    Watch Trailer
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/movies">Browse Movies</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                Your World of{" "}
                <span className="text-primary">Entertainment</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover movies, watch trailers, and read manga — all in one place.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild size="lg">
                  <Link href="/movies">
                    <Film className="h-5 w-5 mr-2" />
                    Browse Movies
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/tv">
                    <Tv className="h-5 w-5 mr-2" />
                    K-Drama & TV
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/manga">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Read Manga
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Row */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: "🎬",
              title: "Thousands of Movies",
              desc: "Discover trending, popular, and top-rated films with full details and trailers.",
            },
            {
              icon: "📺",
              title: "TV Shows & K-Dramas",
              desc: "Watch the latest Korean dramas and top-rated TV series with multi-server streaming.",
            },
            {
              icon: "📖",
              title: "Huge Manga Library",
              desc: "Read thousands of manga chapters in-app from MangaDex's massive collection.",
            },
            {
              icon: "💾",
              title: "Your Personal List",
              desc: "Save favorites, track your watch and reading progress with a free account.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Movies Preview */}
      {trendingMovies.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Movies</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/movies">View All →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {trendingMovies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group block rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <div className="relative aspect-[2/3] bg-muted">
                  {movie.poster_path ? (
                    <Image
                      src={tmdbImageUrl(movie.poster_path) || ""}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Film className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {movie.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* K-Drama Preview */}
      {kdramas.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🇰🇷 K-Drama
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Top Korean dramas right now</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tv?tab=kdrama">View All →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {kdramas.map((show) => (
              <Link
                key={show.id}
                href={`/tv/${show.id}`}
                className="group block rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <div className="relative aspect-[2/3] bg-muted">
                  {show.poster_path ? (
                    <Image
                      src={tvImageUrl(show.poster_path) || ""}
                      alt={show.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Tv className="h-8 w-8 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {show.vote_average.toFixed(1)}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {show.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Manga Preview */}
      {popularManga.length > 0 && (
        <section className="container mx-auto px-4 py-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Popular Manga</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/manga">View All →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {popularManga.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group block rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <div className="relative aspect-[2/3] bg-muted">
                  <Image
                    src={getMangaCoverUrl(manga)}
                    alt={getMangaTitle(manga)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {getMangaTitle(manga)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
