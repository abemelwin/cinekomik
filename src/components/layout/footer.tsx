import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <span>🎬</span>
            <span>CineKomik</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/movies" className="hover:text-foreground transition-colors">Movies</Link>
            <Link href="/tv" className="hover:text-foreground transition-colors">TV Shows</Link>
            <Link href="/manga" className="hover:text-foreground transition-colors">Manga</Link>
            <Link href="/my-list" className="hover:text-foreground transition-colors">My List</Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Movie data by{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              TMDB
            </a>{" "}
            · Manga by{" "}
            <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              MangaDex
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
