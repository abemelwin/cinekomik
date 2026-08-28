import { Suspense } from "react";
import { TVGrid } from "./tv-grid";
import { TVGridSkeleton } from "@/components/tv/tv-card-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TV Shows & K-Drama — CineKomik",
  description: "Browse trending TV shows and Korean dramas.",
};

export default function TVPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string; q?: string };
}) {
  const tab = searchParams.tab || "trending";
  const page = Number(searchParams.page) || 1;
  const query = searchParams.q || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">TV Shows</h1>
        <p className="text-muted-foreground">
          Trending series, K-Dramas, and top-rated shows
        </p>
      </div>

      <Suspense fallback={<TVGridSkeleton />} key={`${tab}-${page}-${query}`}>
        <TVGrid tab={tab} page={page} query={query} />
      </Suspense>
    </div>
  );
}
