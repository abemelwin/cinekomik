import Link from "next/link";
import Image from "next/image";
import { Star, Film } from "lucide-react";
import { tmdbImageUrl, type TMDBMovie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: TMDBMovie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <Link
      href={`/movies/${movie.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={tmdbImageUrl(movie.poster_path) || ""}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Film className="h-12 w-12 opacity-30" />
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-1.5 py-0.5 rounded">
          <Star className="h-3 w-3 fill-yellow-400" />
          {movie.vote_average.toFixed(1)}
        </div>

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
          {movie.title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}
