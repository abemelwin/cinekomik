import Link from "next/link";
import {
  getComickPopular,
  getComickLatest,
  getComickTopRated,
  searchComick,
} from "@/lib/comick";
import { ComickCard } from "@/components/manga/comick-card";
import { MangaSearch } from "./manga-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "popular",   label: "Popular"       },
  { id: "latest",    label: "Latest"        },
  { id: "top_rated", label: "Top Rated"     },
];

interface ComickGridProps {
  tab: string;
  page: number;
  query: string;
}

export async function ComickGrid({ tab, page, query }: ComickGridProps) {
  let comics: Awaited<ReturnType<typeof getComickPopular>> = [];

  try {
    if (query) {
      comics = await searchComick(query, 20);
    } else if (tab === "latest") {
      comics = await getComickLatest(page, 20);
    } else if (tab === "top_rated") {
      comics = await getComickTopRated(page, 20);
    } else {
      comics = await getComickPopular(page, 20);
    }
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-muted-foreground mb-2">Failed to load from Comick.io</p>
        <p className="text-sm text-muted-foreground">API may be temporarily unavailable. Try again later.</p>
      </div>
    );
  }

  const buildUrl = (newTab?: string, newPage?: number, newQuery?: string) => {
    const params = new URLSearchParams();
    params.set("source", "comick");
    if (newTab && newTab !== "popular") params.set("tab", newTab);
    if (newPage && newPage > 1) params.set("page", String(newPage));
    if (newQuery) params.set("q", newQuery);
    return `/manga?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <MangaSearch initialQuery={query} />

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

      {query && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Results for{" "}
            <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
            {" "}on Comick.io
          </p>
          <Link href="/manga?source=comick" className="text-sm text-primary hover:underline">
            Clear
          </Link>
        </div>
      )}

      {comics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📖</p>
          <p className="text-lg font-medium mb-1">No manga found</p>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {comics.map((comic) => (
            <ComickCard key={comic.hid} comic={comic} />
          ))}
        </div>
      )}

      {/* Pagination — comick search doesn't return total, show next/prev only */}
      {!query && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page - 1)}>← Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-2">Page {page}</span>
          {comics.length === 20 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildUrl(tab, page + 1)}>Next →</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
