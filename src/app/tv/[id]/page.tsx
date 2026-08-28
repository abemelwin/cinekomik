import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Calendar, ChevronLeft, Tv, Users,
} from "lucide-react";
import {
  getTVDetails,
  getTVSeason,
  tmdbImageUrl,
} from "@/lib/tmdb-tv";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TVPlayer } from "@/components/tv/tv-player";
import { SeasonEpisodes } from "./season-episodes";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const show = await getTVDetails(Number(params.id));
    return {
      title: `${show.name} — CineKomik`,
      description: show.overview,
    };
  } catch {
    return { title: "TV Show — CineKomik" };
  }
}

export default async function TVDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { season?: string };
}) {
  let show: Awaited<ReturnType<typeof getTVDetails>>;

  try {
    show = await getTVDetails(Number(params.id));
  } catch {
    notFound();
  }

  const isKorean = show.original_language === "ko";
  const backdropUrl = tmdbImageUrl(show.backdrop_path, "original");
  const posterUrl = tmdbImageUrl(show.poster_path, "w500");
  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : null;
  const cast = show.credits?.cast?.slice(0, 10) || [];

  // Season currently viewing (default: first real season)
  const realSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const activeSeason =
    Number(searchParams.season) ||
    (realSeasons[0]?.season_number ?? 1);

  // Fetch episode list for active season
  let seasonDetails: Awaited<ReturnType<typeof getTVSeason>> | null = null;
  try {
    seasonDetails = await getTVSeason(Number(params.id), activeSeason);
  } catch {
    // non-critical — page still renders
  }

  const episodeCount = seasonDetails?.episodes?.length ?? 0;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {backdropUrl ? (
          <Image src={backdropUrl} alt={show.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-black/60 backdrop-blur-sm">
            <Link href="/tv">
              <ChevronLeft className="h-4 w-4 mr-1" /> TV Shows
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 -mt-32 md:-mt-48 relative z-10 pb-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/50">
              {posterUrl ? (
                <Image src={posterUrl} alt={show.name} fill className="object-cover" priority />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                  <Tv className="h-16 w-16 opacity-30" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{show.name}</h1>
              {isKorean && (
                <span className="bg-rose-500/90 text-white text-xs font-bold px-2 py-1 rounded self-start mt-1">
                  K-Drama
                </span>
              )}
            </div>
            {show.tagline && (
              <p className="text-muted-foreground italic mb-4">{show.tagline}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-foreground font-semibold">{show.vote_average.toFixed(1)}</span>
                <span>/ 10</span>
              </span>
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />{year}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Tv className="h-4 w-4" />
                {show.number_of_seasons} season{show.number_of_seasons !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {show.number_of_episodes} episodes
              </span>
              {show.status && (
                <Badge variant="outline" className="text-xs capitalize">{show.status}</Badge>
              )}
            </div>

            {/* Genres */}
            {show.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((g) => (
                  <Badge key={g.id} variant="secondary">{g.name}</Badge>
                ))}
              </div>
            )}

            {/* Networks */}
            {show.networks?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Network:</span>
                {show.networks.map((n) => (
                  <span key={n.id}>{n.name}</span>
                ))}
              </div>
            )}

            {/* Watch button */}
            <div className="flex flex-wrap gap-3 mb-6">
              <TVPlayer
                tmdbId={show.id}
                showTitle={show.name}
                initialSeason={activeSeason}
                initialEpisode={1}
                totalEpisodes={episodeCount || 1}
                totalSeasons={show.number_of_seasons}
              />
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {show.overview || "No overview available."}
              </p>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Cast</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {cast.map((person) => (
                    <div key={person.id} className="flex-shrink-0 text-center w-20">
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
                      <p className="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Season tabs + Episode list */}
        {realSeasons.length > 0 && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold">Episodes</h2>
              {/* Season switcher */}
              {realSeasons.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {realSeasons.map((s) => (
                    <Link
                      key={s.season_number}
                      href={`/tv/${params.id}?season=${s.season_number}`}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeSeason === s.season_number
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      S{s.season_number}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <SeasonEpisodes
              episodes={seasonDetails?.episodes || []}
              tvId={Number(params.id)}
              showTitle={show.name}
              seasonNumber={activeSeason}
              totalSeasons={show.number_of_seasons}
            />
          </div>
        )}
      </div>
    </div>
  );
}
