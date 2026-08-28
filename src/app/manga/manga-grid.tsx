import Link from "next/link";
import { getPopularManga, getLatestManga, searchManga } from "@/lib/mangadex";
import { MangaCard } from "@/components/manga/manga-card";
import { MangaSearch } from "./manga-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const TABS = [
  { id: "popular", label: "Popular" },
  { id: "latest", label: "Latest Updates" },
];

interface MangaGridProps {
  tab: string;
  page: number;
  query: string;
}

export async function MangaGrid({ tab, page, query }: MangaGridProps) {
  const offset = (page - 1) * PAGE_SIZE;
  let manga: Awaited<ReturnType<typeof getPopularManga>>["data"] = [];
  let total = 0;

  try {
    if (query) {
      const data = await searchManga(query, PAGE_SIZE);
      manga = data.data;
      total = data.total;
    } else if (tab === "latest") {
      const data = await getLatestManga(PAGE_SIZE, offset);
      manga = data.data;
      total = data.total;
    } else {
      const data = await getPopularManga(PAGE_SIZE, offset);
      manga = data.data;
      total = data.total;
    }
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-muted-foreground mb-2">Failed to load manga.</p>
        <p className="text-sm text-muted-foreground">
          MangaDex API may be temporarily unavailable. Try again later.
        </p>
      </div>
    );
  }

  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE), 50);

  const buildUrl = (newTab?: string, newPage?: number, newQuery?: string) => {
    const params = new URLSearchParams();
    if (newTab && newTab !== "popular") params.set("tab", newTab);
    if (newPage && newPage > 1) params.set("page", String(newPage));
    if (newQuery) params.set("q", newQuery);
    const qs = params.toString();
    return `/manga${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <MangaSearch initialQuery={query} />

      {/* Tabs */}
      {!query && (
        <div className="flex gap-2 border-b border-border pb-4">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={buildUrl(t.id, 1)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {/* Search results header */}
      {query && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing results for{" "}
            <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
          </p>
          <Link href="/manga" className="text-sm text-primary hover:underline">
            Clear search
          </Link>
        </div>
      )}

      {/* Grid */}
      {manga.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📖</p>
          <p className="text-lg font-medium mb-1">No manga found</p>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {manga.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!query && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page - 1)}>← Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page + 1)}>Next →</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
