import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, BookOpen, User, Calendar } from "lucide-react";
import {
  getMangaById,
  getMangaChapters,
  getMangaTitle,
  getMangaDescription,
  getMangaCoverUrl,
  getMangaTags,
  type MangaDexChapter,
} from "@/lib/mangadex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadingListButton } from "@/components/manga/reading-list-button";
import { ContinueReadingButton } from "@/components/manga/continue-reading-button";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { data: manga } = await getMangaById(params.id);
    return {
      title: `${getMangaTitle(manga)} — CineKomik`,
      description: getMangaDescription(manga),
    };
  } catch {
    return { title: "Manga — CineKomik" };
  }
}

export default async function MangaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let manga: Awaited<ReturnType<typeof getMangaById>>["data"];
  let chapters: MangaDexChapter[] = [];

  try {
    const [mangaRes, chaptersRes] = await Promise.all([
      getMangaById(params.id),
      getMangaChapters(params.id, 500, 0),
    ]);
    manga = mangaRes.data;
    chapters = chaptersRes.data;
  } catch {
    notFound();
  }

  const title = getMangaTitle(manga);
  const description = getMangaDescription(manga);
  const coverUrl = getMangaCoverUrl(manga, "512");
  const tags = getMangaTags(manga);
  const status = manga.attributes.status;
  const year = manga.attributes.year;

  // Get author from relationships
  const authorRel = manga.relationships.find((r) => r.type === "author");
  const authorName =
    (authorRel?.attributes as { name?: string } | undefined)?.name || null;

  // Deduplicate chapters by number
  const seen = new Set<string>();
  const uniqueChapters = chapters.filter((ch) => {
    const key = ch.attributes.chapter || ch.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const firstChapterId = uniqueChapters[0]?.id;

  return (
    <div className="min-h-screen">
      {/* Header background */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-black/60 backdrop-blur-sm">
            <Link href="/manga">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Manga
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
                alt={title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
              {authorName && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {authorName}
                </span>
              )}
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {year}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {uniqueChapters.length} chapters
              </span>
              {status && (
                <Badge variant="outline" className="capitalize">
                  {status}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <ContinueReadingButton
                mangaId={params.id}
                firstChapterId={firstChapterId}
              />
              <ReadingListButton
                mangaId={params.id}
                mangaTitle={title}
                coverUrl={coverUrl}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        {uniqueChapters.length > 0 && (
          <div className="pb-16">
            <h2 className="text-xl font-bold mb-4">
              Chapters ({uniqueChapters.length})
            </h2>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {uniqueChapters.map((chapter) => {
                const chNum = chapter.attributes.chapter;
                const chTitle = chapter.attributes.title;
                const date = chapter.attributes.publishAt
                  ? new Date(chapter.attributes.publishAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null;

                // Skip chapters with external URLs (can't be read in-app)
                if (chapter.attributes.externalUrl) return null;

                return (
                  <Link
                    key={chapter.id}
                    href={`/manga/${params.id}/chapter/${chapter.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 text-sm font-semibold text-primary w-20">
                        {chNum ? `Ch. ${chNum}` : "Oneshot"}
                      </span>
                      <span className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {chTitle || (chNum ? `Chapter ${chNum}` : "Read Chapter")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {date && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {date}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                        {chapter.attributes.pages}p
                      </span>
                    </div>
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
