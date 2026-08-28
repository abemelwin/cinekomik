"use client";

import { useState } from "react";
import { Tv2, X, ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Server {
  id: string;
  name: string;
  url: (tmdbId: number) => string;
  badge?: string;
}

const SERVERS: Server[] = [
  {
    id: "vidsrc-to",
    name: "VidSrc",
    badge: "Best",
    url: (id) => `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: "vidsrc-mov",
    name: "VidSrc Pro",
    badge: "1080p",
    url: (id) => `https://vidsrc.mov/embed/movie/${id}`,
  },
  {
    id: "vidsrc-me",
    name: "VidSrc.me",
    url: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: "zoryva",
    name: "Zoryva X",
    url: (id) => `https://zoryvax.neonnexusx.games/embed/movie/${id}`,
  },
  {
    id: "vidsrc-io",
    name: "VidSrc.io",
    url: (id) => `https://vidsrc.io/embed/movie/${id}`,
  },
];

interface MoviePlayerProps {
  tmdbId: number;
  movieTitle: string;
}

export function MoviePlayer({ tmdbId, movieTitle }: MoviePlayerProps) {
  const [open, setOpen] = useState(false);
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [iframeKey, setIframeKey] = useState(0);
  const [showServers, setShowServers] = useState(false);

  const handleServerChange = (server: Server) => {
    setActiveServer(server);
    setIframeKey((k) => k + 1); // force iframe reload
    setShowServers(false);
  };

  const handleRefresh = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <Tv2 className="h-5 w-5" />
        Watch Movie
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-border gap-0">
          <DialogTitle className="sr-only">{movieTitle} — Watch Movie</DialogTitle>

          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-background/95 border-b border-border">
            {/* Server selector */}
            <div className="relative">
              <button
                onClick={() => setShowServers((s) => !s)}
                className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
              >
                <Tv2 className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline text-muted-foreground">Server:</span>
                <span>{activeServer.name}</span>
                {activeServer.badge && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {activeServer.badge}
                  </span>
                )}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showServers && "rotate-180")} />
              </button>

              {/* Server dropdown */}
              {showServers && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-medium uppercase tracking-wider">
                    Switch Server
                  </p>
                  {SERVERS.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => handleServerChange(server)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors",
                        activeServer.id === server.id && "bg-primary/10 text-primary"
                      )}
                    >
                      <span>{server.name}</span>
                      <div className="flex items-center gap-2">
                        {server.badge && (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            {server.badge}
                          </span>
                        )}
                        {activeServer.id === server.id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      If one server doesn&apos;t work, try another.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Reload player"
                title="Reload player"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              key={`${activeServer.id}-${iframeKey}`}
              src={activeServer.url(tmdbId)}
              title={`${movieTitle} — ${activeServer.name}`}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              className="absolute inset-0 w-full h-full"
              referrerPolicy="origin"
            />
          </div>

          {/* Bottom hint */}
          <div className="px-3 py-2 bg-background/95 border-t border-border flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{movieTitle}</span>
              <span className="mx-1.5">·</span>
              {activeServer.name}
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Not loading? Try a different server above.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
