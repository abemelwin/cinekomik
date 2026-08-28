import { Suspense } from "react";
import Link from "next/link";
import { MangaGrid } from "./manga-grid";
import { ComickGrid } from "./comick-grid";
import { MangaGridSkeleton } from "@/components/manga/manga-card-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manga — CineKomik",
  description: "Browse and read popular manga from MangaDex and Comick.io.",
};

export default function MangaPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string; q?: string; source?: string };
}) {
  const source = searchParams.source === "comick" ? "comick" : "mangadex";
  const tab    = searchParams.tab  || "popular";
  const page   = Number(searchParams.page) || 1;
  const query  = searchParams.q || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Manga</h1>
        <p className="text-muted-foreground">
          Browse and read thousands of manga
        </p>
      </div>

      {/* Source switcher */}
      <div className="flex gap-2 mb-6">
        <Link
          href={`/manga?source=mangadex${query ? `&q=${query}` : ""}`}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
            source === "mangadex"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <span>📚</span> MangaDex
        </Link>
        <Link
          href={`/manga?source=comick${query ? `&q=${query}` : ""}`}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
            source === "comick"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <span>🗂️</span> Comick.io
        </Link>
      </div>

      {/* Grid — swap based on source */}
      <Suspense fallback={<MangaGridSkeleton />} key={`${source}-${tab}-${page}-${query}`}>
        {source === "comick" ? (
          <ComickGrid tab={tab} page={page} query={query} />
        ) : (
          <MangaGrid tab={tab} page={page} query={query} />
        )}
      </Suspense>
    </div>
  );
}
