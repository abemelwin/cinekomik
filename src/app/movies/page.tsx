import { Suspense } from "react";
import { MovieGrid } from "./movie-grid";
import { MovieGridSkeleton } from "@/components/movies/movie-card-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Movies — CineKomik",
  description: "Browse trending, popular, and top-rated movies.",
};

export default function MoviesPage({
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
        <h1 className="text-3xl font-bold mb-1">Movies</h1>
        <p className="text-muted-foreground">
          Discover trending, popular, and top-rated films
        </p>
      </div>

      <Suspense fallback={<MovieGridSkeleton />} key={`${tab}-${page}-${query}`}>
        <MovieGrid tab={tab} page={page} query={query} />
      </Suspense>
    </div>
  );
}
