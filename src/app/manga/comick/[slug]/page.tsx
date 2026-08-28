import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, BookOpen, User, Calendar } from "lucide-react";
import {
  getComickComic,
  getComickChapters,
  getComickCoverUrl,
  getComickStatus,
  getComickGenres,
  type ComickChapter,
} from "@/lib/comick";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const { comic } = await getComickComic(params.slug);
    return {
      title: `${comic.title} — CineKomik`,
      description: comic.desc?.slice(0, 160) ?? "",
    };
  } catch {
    return { title: "Manga — CineKomik" };
  }
}

export default async function ComickMangaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let comic: Awaited<ReturnType<typeof getComickComic>>["comic"];
  let chapters: ComickChapter[] = [];

  try {
    const [comicRes, chaptersRes] = await Promise.all([
      getComickComic(params.slug),
      getComickChapters(params.slug, 500, 1),
    ]);
    comic    = comicRes.comic;
    chapters = chaptersRes.chapters ?? [];
  } catch {
    notFound();
  }

  const coverUrl = getComickCoverUrl(comic);
  const status   = getComickStatus(comic.status);
  const genres   = getComickGenres(comic);
  const authors  = comic.authors?.map((a) => a.name) ?? [];
  const firstChapter = chapters[0];

  const STATUS_COLORS: Record<string, string> = {
    ongoing:   "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hiatus:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen">
      {/* Header bg */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            asChild variant="ghost" size="sm"
            className="bg-black/40 hover:bg-black/60 backdrop-blur-sm"
          >
            <Link href="/manga?source=comick">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Comick.io
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 -mt-32 md:-mt-40 relative z-10 pb-16">
          {/* Cover */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-44 md:w-56 aspect-[2/3] rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/50">
              <Image
                src={coverUrl}
                alt={comic.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Source badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                Comick.io
              </span>
              {comic.country && (
                <span className="text-xs text-muted-foreground uppercase">
                  {comic.country === "jp" ? "🇯🇵 Manga" :
                   comic.country === "kr" ? "🇰🇷 Manhwa" :
                   comic.country === "cn" ? "🇨🇳 Manhua" :
                   comic.country.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {comic.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
              {authors.length > 0 && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {authors.join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {chapters.length} chapters
              </span>
              {comic.last_chapter && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Latest: Ch. {comic.last_chapter}
                </span>
              )}
              {status && (
                <Badge
                  variant="outline"
                  className={`capitalize text-xs ${STATUS_COLORS[status] ?? ""}`}
                >
                  {status}
                </Badge>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((g) => (
                  <Badge key={g} variant="secondary">{g}</Badge>
                ))}
              </div>
            )}

            {/* Start reading button */}
            {firstChapter && (
              <div className="flex flex-wrap gap-3 mb-6">
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/manga/comick/${params.slug}/chapter/${firstChapter.hid}`}>
                    <BookOpen className="h-4 w-4" />
                    Start Reading
                  </Link>
                </Button>
              </div>
            )}

            {/* Description */}
            {comic.desc && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                  {comic.desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter list */}
        {chapters.length > 0 && (
          <div className="pb-16">
            <h2 className="text-xl font-bold mb-4">
              Chapters ({chapters.length})
            </h2>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {chapters.map((ch) => {
                const date = ch.created_at
                  ? new Date(ch.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })
                  : null;
                const label = ch.chap ? `Ch. ${ch.chap}` : "Oneshot";
                const groups = ch.group_name?.join(", ") ?? "";

                return (
                  <Link
                    key={ch.hid}
                    href={`/manga/comick/${params.slug}/chapter/${ch.hid}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 text-sm font-semibold text-primary w-20">
                        {label}
                      </span>
                      <span className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {ch.title || (ch.chap ? `Chapter ${ch.chap}` : "Read Chapter")}
                        {groups && (
                          <span className="ml-2 text-xs text-muted-foreground/60">
                            [{groups}]
                          </span>
                        )}
                      </span>
                    </div>
                    {date && (
                      <span className="text-xs text-muted-foreground hidden sm:block flex-shrink-0 ml-4">
                        {date}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
