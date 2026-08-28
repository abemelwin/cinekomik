import Link from "next/link";
import Image from "next/image";
import { Star, Tv } from "lucide-react";
import { tmdbImageUrl, type TMDBTVShow } from "@/lib/tmdb-tv";
import { cn } from "@/lib/utils";

interface TVCardProps {
  show: TMDBTVShow;
  className?: string;
  showKDramaBadge?: boolean;
}

export function TVCard({ show, className, showKDramaBadge }: TVCardProps) {
  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : null;
  const isKorean = show.original_language === "ko";

  return (
    <Link
      href={`/tv/${show.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {show.poster_path ? (
          <Image
            src={tmdbImageUrl(show.poster_path) || ""}
            alt={show.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Tv className="h-12 w-12 opacity-30" />
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-1.5 py-0.5 rounded">
          <Star className="h-3 w-3 fill-yellow-400" />
          {show.vote_average.toFixed(1)}
        </div>

        {/* K-Drama badge */}
        {(showKDramaBadge || isKorean) && (
          <div className="absolute top-2 left-2 bg-rose-500/90 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            K-Drama
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
            View Details
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {show.name}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}
