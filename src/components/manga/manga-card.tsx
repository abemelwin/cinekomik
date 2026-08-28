import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type MangaDexManga,
  getMangaTitle,
  getMangaCoverUrl,
  getMangaTags,
} from "@/lib/mangadex";
import { cn } from "@/lib/utils";

interface MangaCardProps {
  manga: MangaDexManga;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  hiatus: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function MangaCard({ manga, className }: MangaCardProps) {
  const title = getMangaTitle(manga);
  const coverUrl = getMangaCoverUrl(manga, "256");
  const tags = getMangaTags(manga);
  const status = manga.attributes.status;

  return (
    <Link
      href={`/manga/${manga.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          unoptimized
        />

        {/* Status badge */}
        {status && (
          <div
            className={cn(
              "absolute top-2 left-2 text-xs font-semibold px-1.5 py-0.5 rounded border capitalize",
              STATUS_COLORS[status] || "bg-secondary text-secondary-foreground border-secondary"
            )}
          >
            {status}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            Read Now
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
