"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Rows,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

interface ReaderClientProps {
  mangaId: string;
  chapterId: string;
  chapterNumber: string | null;
  chapterTitle: string | null;
  pages: string[];
  prevChapterId: string | null;
  nextChapterId: string | null;
}

export function ReaderClient({
  mangaId,
  chapterId,
  chapterNumber,
  chapterTitle,
  pages,
  prevChapterId,
  nextChapterId,
}: ReaderClientProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [mode, setMode] = useState<"scroll" | "page">("scroll");
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Save reading progress
  useEffect(() => {
    if (!user) return;
    supabase.from("reading_progress").upsert(
      {
        user_id: user.id,
        manga_id: mangaId,
        chapter_id: chapterId,
        chapter_number: chapterNumber,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,manga_id" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mangaId, chapterId, chapterNumber]);

  // Keyboard navigation in page mode
  useEffect(() => {
    if (mode !== "page") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentPage((p) => Math.max(p - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, pages.length]);

  const chapterLabel = chapterNumber
    ? `Chapter ${chapterNumber}`
    : chapterTitle || "Chapter";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div
        className={cn(
          "sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border transition-all duration-200",
          !showControls && "opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
              <Link href={`/manga/${mangaId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{chapterLabel}</p>
              {chapterTitle && chapterTitle !== chapterLabel && (
                <p className="text-xs text-muted-foreground truncate">{chapterTitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode((m) => (m === "scroll" ? "page" : "scroll"));
                setCurrentPage(0);
              }}
              className="gap-1.5 text-xs"
            >
              {mode === "scroll" ? (
                <>
                  <LayoutList className="h-3.5 w-3.5" />
                  Page Mode
                </>
              ) : (
                <>
                  <Rows className="h-3.5 w-3.5" />
                  Scroll Mode
                </>
              )}
            </Button>

            {/* Chapter navigation */}
            <div className="flex gap-1">
              {prevChapterId ? (
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                  <Link href={`/manga/${mangaId}/chapter/${prevChapterId}`}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {nextChapterId ? (
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                  <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader content */}
      {mode === "scroll" ? (
        // Vertical scroll mode
        <div
          className="max-w-3xl mx-auto cursor-pointer"
          onClick={() => setShowControls((s) => !s)}
        >
          {pages.map((src, i) => (
            <div key={i} className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Page ${i + 1}`}
                className="w-full h-auto block"
                loading={i < 3 ? "eager" : "lazy"}
              />
            </div>
          ))}

          {/* End of chapter */}
          <div className="py-12 flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground">End of {chapterLabel}</p>
            <div className="flex gap-3">
              {prevChapterId && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${mangaId}/chapter/${prevChapterId}`}>
                    ← Previous Chapter
                  </Link>
                </Button>
              )}
              {nextChapterId && (
                <Button asChild>
                  <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`}>
                    Next Chapter →
                  </Link>
                </Button>
              )}
              {!nextChapterId && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${mangaId}`}>Back to Manga</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Page-by-page mode
        <div
          className="flex flex-col items-center min-h-[calc(100vh-3.5rem)] relative"
          onClick={() => setShowControls((s) => !s)}
        >
          <div className="relative w-full max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1} of ${pages.length}`}
              className="w-full h-auto block mx-auto"
            />
          </div>

          {/* Page navigation overlay */}
          <div
            className={cn(
              "fixed bottom-6 left-0 right-0 flex items-center justify-center gap-4 transition-all duration-200",
              !showControls && "opacity-0 pointer-events-none"
            )}
          >
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur border border-border rounded-full px-4 py-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.max(p - 1, 0));
                }}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {currentPage + 1} / {pages.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
                }}
                disabled={currentPage === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Next chapter prompt on last page */}
          {currentPage === pages.length - 1 && nextChapterId && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <p className="text-muted-foreground text-sm">End of chapter</p>
              <Button asChild>
                <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`}>
                  Next Chapter →
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
