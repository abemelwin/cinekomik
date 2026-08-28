"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, BookOpen, Trash2, Play, Heart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface WatchlistItem {
  id: string;
  movie_id: string;
  movie_title: string;
  poster_url: string | null;
  created_at: string;
}

interface ReadingListItem {
  id: string;
  manga_id: string;
  manga_title: string;
  cover_url: string | null;
  created_at: string;
}

interface ReadingProgress {
  manga_id: string;
  chapter_id: string;
  chapter_number: string | null;
  updated_at: string;
}

interface MyListClientProps {
  watchlist: WatchlistItem[];
  readingList: ReadingListItem[];
  progressMap: Record<string, ReadingProgress>;
}

export function MyListClient({ watchlist, readingList, progressMap }: MyListClientProps) {
  const [movies, setMovies] = useState(watchlist);
  const [manga, setManga] = useState(readingList);
  const supabase = createClient();

  const removeMovie = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const removeManga = async (id: string) => {
    await supabase.from("reading_list").delete().eq("id", id);
    setManga((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Tabs defaultValue="movies">
      <TabsList className="mb-6">
        <TabsTrigger value="movies" className="gap-2">
          <Film className="h-4 w-4" />
          Movies
          {movies.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {movies.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="manga" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Manga
          {manga.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {manga.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Movies tab */}
      <TabsContent value="movies">
        {movies.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-8 w-8 text-muted-foreground" />}
            title="No movies saved yet"
            description="Browse movies and add them to your watchlist."
            href="/movies"
            linkLabel="Browse Movies"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all">
                <Link href={`/movies/${item.movie_id}`}>
                  <div className="relative aspect-[2/3] bg-muted">
                    {item.poster_url ? (
                      <Image
                        src={item.poster_url}
                        alt={item.movie_title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Film className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.movie_title}
                    </p>
                  </div>
                </Link>
                {/* Remove button */}
                <button
                  onClick={() => removeMovie(item.id)}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-destructive rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Remove from watchlist"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Manga tab */}
      <TabsContent value="manga">
        {manga.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
            title="No manga saved yet"
            description="Browse manga and add them to your reading list."
            href="/manga"
            linkLabel="Browse Manga"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {manga.map((item) => {
              const progress = progressMap[item.manga_id];
              return (
                <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary transition-all">
                  <Link href={`/manga/${item.manga_id}`}>
                    <div className="relative aspect-[2/3] bg-muted">
                      {item.cover_url ? (
                        <Image
                          src={item.cover_url}
                          alt={item.manga_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 20vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <BookOpen className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      {/* Progress badge */}
                      {progress && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-xs text-center rounded py-0.5 text-primary font-medium">
                          Ch. {progress.chapter_number || "?"}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.manga_title}
                      </p>
                    </div>
                  </Link>

                  {/* Continue reading quick button */}
                  {progress && (
                    <Link
                      href={`/manga/${item.manga_id}/chapter/${progress.chapter_id}`}
                      className="absolute top-2 left-2 bg-primary/90 hover:bg-primary rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Continue reading"
                    >
                      <Play className="h-3.5 w-3.5 text-primary-foreground fill-current" />
                    </Link>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeManga(item.id)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-destructive rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Remove from reading list"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 p-4 rounded-full bg-accent">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      <Button asChild>
        <Link href={href}>{linkLabel}</Link>
      </Button>
    </div>
  );
}
