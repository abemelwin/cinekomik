import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, ChevronLeft, Film } from "lucide-react";
import { getMovieDetails, getOfficialTrailer, tmdbImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrailerPlayer } from "@/components/movies/trailer-player";
import { MoviePlayer } from "@/components/movies/movie-player";
import { WatchlistButton } from "@/components/movies/watchlist-button";
import { formatRuntime } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const movie = await getMovieDetails(Number(params.id));
    return {
      title: `${movie.title} — CineKomik`,
      description: movie.overview,
    };
  } catch {
    return { title: "Movie — CineKomik" };
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let movie: Awaited<ReturnType<typeof getMovieDetails>>;

  try {
    movie = await getMovieDetails(Number(params.id));
  } catch {
    notFound();
  }

  const trailer = movie.videos?.results
    ? getOfficialTrailer(movie.videos.results)
    : null;

  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const backdropUrl = tmdbImageUrl(movie.backdrop_path, "original");
  const posterUrl = tmdbImageUrl(movie.poster_path, "w500");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-black/60 backdrop-blur-sm">
            <Link href="/movies">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Movies
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 -mt-32 md:-mt-48 relative z-10 pb-16">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/50">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                  <Film className="h-16 w-16 opacity-30" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-1">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-muted-foreground italic mb-4">{movie.tagline}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-foreground font-semibold">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span>/ 10</span>
              </span>
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {year}
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}
              {movie.status && (
                <Badge variant="outline" className="text-xs">
                  {movie.status}
                </Badge>
              )}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="secondary">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <MoviePlayer tmdbId={movie.id} movieTitle={movie.title} />
              {trailer ? (
                <TrailerPlayer trailer={trailer} movieTitle={movie.title} />
              ) : null}
              <WatchlistButton
                movieId={movie.id}
                movieTitle={movie.title}
                posterUrl={posterUrl}
              />
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Cast</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {cast.map((person) => (
                    <div
                      key={person.id}
                      className="flex-shrink-0 text-center w-20"
                    >
                      <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted border border-border mb-1.5">
                        {person.profile_path ? (
                          <Image
                            src={tmdbImageUrl(person.profile_path, "w185") || ""}
                            alt={person.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-lg font-bold">
                            {person.name[0]}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium line-clamp-1">{person.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {person.character}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
