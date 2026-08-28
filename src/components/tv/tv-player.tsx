"use client";

import { useState } from "react";
import { Tv2, X, ChevronDown, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Server {
  id: string;
  name: string;
  badge?: string;
  url: (tmdbId: number, season: number, episode: number) => string;
}

const SERVERS: Server[] = [
  {
    id: "vidsrc-to",
    name: "VidSrc",
    badge: "Best",
    url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-mov",
    name: "VidSrc Pro",
    badge: "1080p",
    url: (id, s, e) => `https://vidsrc.mov/embed/tv/${id}?season=${s}&episode=${e}`,
  },
  {
    id: "vidsrc-me",
    name: "VidSrc.me",
    url: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "zoryva",
    name: "Zoryva X",
    url: (id, s, e) => `https://zoryvax.neonnexusx.games/embed/tv/${id}?season=${s}&episode=${e}`,
  },
  {
    id: "vidsrc-io",
    name: "VidSrc.io",
    url: (id, s, e) => `https://vidsrc.io/embed/tv/${id}/${s}/${e}`,
  },
];

interface TVPlayerProps {
  tmdbId: number;
  showTitle: string;
  initialSeason?: number;
  initialEpisode?: number;
  totalEpisodes?: number;
  totalSeasons?: number;
}

export function TVPlayer({
  tmdbId,
  showTitle,
  initialSeason = 1,
  initialEpisode = 1,
  totalEpisodes = 1,
  totalSeasons = 1,
}: TVPlayerProps) {
  const [open, setOpen] = useState(false);
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [iframeKey, setIframeKey] = useState(0);
  const [showServers, setShowServers] = useState(false);

  const reload = () => setIframeKey((k) => k + 1);

  const handleServerChange = (server: Server) => {
    setActiveServer(server);
    reload();
    setShowServers(false);
  };

  const handleEpisodeChange = (newEp: number) => {
    setEpisode(newEp);
    setIframeKey((k) => k + 1);
  };

  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason);
    setEpisode(1);
    setIframeKey((k) => k + 1);
  };

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
        <Tv2 className="h-5 w-5" />
        Watch Episode
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-border gap-0">
          <DialogTitle className="sr-only">
            {showTitle} — S{season} E{episode}
          </DialogTitle>

          {/* Top bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-background/95 border-b border-border flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Server selector */}
              <div className="relative">
                <button
                  onClick={() => setShowServers((s) => !s)}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <Tv2 className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline text-muted-foreground text-xs">Server:</span>
                  <span>{activeServer.name}</span>
                  {activeServer.badge && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {activeServer.badge}
                    </span>
                  )}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showServers && "rotate-180")} />
                </button>

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

              {/* Season selector */}
              {totalSeasons > 1 && (
                <select
                  value={season}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="text-sm bg-accent border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Select season"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>Season {s}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Episode nav + controls */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                S{season} E{episode}/{totalEpisodes}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEpisodeChange(Math.max(1, episode - 1))}
                disabled={episode <= 1}
                aria-label="Previous episode"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEpisodeChange(Math.min(totalEpisodes, episode + 1))}
                disabled={episode >= totalEpisodes}
                aria-label="Next episode"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <button
                onClick={reload}
                className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground ml-1"
                aria-label="Reload player"
                title="Reload"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              key={`${activeServer.id}-s${season}e${episode}-${iframeKey}`}
              src={activeServer.url(tmdbId, season, episode)}
              title={`${showTitle} S${season}E${episode}`}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              className="absolute inset-0 w-full h-full"
              referrerPolicy="origin"
            />
          </div>

          {/* Bottom bar */}
          <div className="px-3 py-2 bg-background/95 border-t border-border flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{showTitle}</span>
              <span className="mx-1.5">·</span>
              Season {season}, Episode {episode}
              <span className="mx-1.5">·</span>
              {activeServer.name}
            </p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(totalEpisodes, 20) }, (_, i) => i + 1).map((ep) => (
                <button
                  key={ep}
                  onClick={() => handleEpisodeChange(ep)}
                  className={cn(
                    "h-7 w-7 text-xs rounded transition-colors",
                    ep === episode
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-accent hover:bg-primary/20 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ep}
                </button>
              ))}
              {totalEpisodes > 20 && (
                <span className="text-xs text-muted-foreground self-center ml-1">
                  +{totalEpisodes - 20} more
                </span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
