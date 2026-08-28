"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Clock } from "lucide-react";
import { tmdbImageUrl, type TMDBEpisode } from "@/lib/tmdb-tv";
import { cn } from "@/lib/utils";

interface SeasonEpisodesProps {
  episodes: TMDBEpisode[];
  tvId: number;
  showTitle: string;
  seasonNumber: number;
  totalSeasons: number;
}

export function SeasonEpisodes({
  episodes,
  tvId,
  showTitle,
  seasonNumber,
  totalSeasons,
}: SeasonEpisodesProps) {
  const [selectedEp, setSelectedEp] = useState<number | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No episodes available for this season.
      </div>
    );
  }

  const handleWatch = (epNumber: number) => {
    setSelectedEp(epNumber);
    setPlayerOpen(true);
  };

  return (
    <>
      {/* Hidden TVPlayer — controlled programmatically */}
      {selectedEp !== null && playerOpen && (
        <TVPlayerModal
          tvId={tvId}
          showTitle={showTitle}
          seasonNumber={seasonNumber}
          episodeNumber={selectedEp}
          totalEpisodes={episodes.length}
          totalSeasons={totalSeasons}
          onClose={() => setPlayerOpen(false)}
        />
      )}

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {episodes.map((ep) => {
          const stillUrl = tmdbImageUrl(ep.still_path, "w300");
          const airDate = ep.air_date
            ? new Date(ep.air_date).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })
            : null;

          return (
            <div
              key={ep.id}
              className="flex gap-4 p-4 hover:bg-accent/50 transition-colors group"
            >
              {/* Thumbnail */}
              <button
                onClick={() => handleWatch(ep.episode_number)}
                className="relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-lg overflow-hidden bg-muted"
                aria-label={`Watch episode ${ep.episode_number}`}
              >
                {stillUrl ? (
                  <Image
                    src={stillUrl}
                    alt={ep.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Play className="h-8 w-8 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary rounded-full p-2">
                    <Play className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
              </button>

              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <span className="text-xs text-primary font-semibold">
                      Episode {ep.episode_number}
                    </span>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                      {ep.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleWatch(ep.episode_number)}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                      "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Watch
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {airDate && <span>{airDate}</span>}
                  {ep.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ep.runtime}m
                    </span>
                  )}
                  {ep.vote_average > 0 && (
                    <span>⭐ {ep.vote_average.toFixed(1)}</span>
                  )}
                </div>

                {ep.overview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {ep.overview}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Wrapper that auto-opens the TVPlayer modal
function TVPlayerModal({
  tvId,
  showTitle,
  seasonNumber,
  episodeNumber,
  totalEpisodes,
  totalSeasons,
  onClose,
}: {
  tvId: number;
  showTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  totalEpisodes: number;
  totalSeasons: number;
  onClose: () => void;
}) {
  // Mount with open=true using a controlled TVPlayer variant
  return (
    <TVPlayerControlled
      tmdbId={tvId}
      showTitle={showTitle}
      initialSeason={seasonNumber}
      initialEpisode={episodeNumber}
      totalEpisodes={totalEpisodes}
      totalSeasons={totalSeasons}
      defaultOpen
      onClose={onClose}
    />
  );
}

// TVPlayer variant that accepts defaultOpen + onClose
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Tv2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVERS = [
  { id: "vidsrc-to",  name: "VidSrc",     badge: "Best",  url: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
  { id: "vidsrc-mov", name: "VidSrc Pro",  badge: "1080p", url: (id: number, s: number, e: number) => `https://vidsrc.mov/embed/tv/${id}?season=${s}&episode=${e}` },
  { id: "vidsrc-me",  name: "VidSrc.me",  badge: undefined, url: (id: number, s: number, e: number) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { id: "zoryva",     name: "Zoryva X",   badge: undefined, url: (id: number, s: number, e: number) => `https://zoryvax.neonnexusx.games/embed/tv/${id}?season=${s}&episode=${e}` },
  { id: "vidsrc-io",  name: "VidSrc.io",  badge: undefined, url: (id: number, s: number, e: number) => `https://vidsrc.io/embed/tv/${id}/${s}/${e}` },
];

function TVPlayerControlled({
  tmdbId, showTitle, initialSeason, initialEpisode,
  totalEpisodes, totalSeasons, defaultOpen, onClose,
}: {
  tmdbId: number; showTitle: string; initialSeason: number; initialEpisode: number;
  totalEpisodes: number; totalSeasons: number; defaultOpen?: boolean; onClose?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [iframeKey, setIframeKey] = useState(0);
  const [showServers, setShowServers] = useState(false);

  const reload = () => setIframeKey((k) => k + 1);

  const handleClose = (val: boolean) => {
    setOpen(val);
    if (!val && onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-border gap-0">
        <DialogTitle className="sr-only">{showTitle} S{season}E{episode}</DialogTitle>

        <div className="flex items-center justify-between px-3 py-2 bg-background/95 border-b border-border flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowServers((s) => !s)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
              >
                <Tv2 className="h-4 w-4 text-primary" />
                <span>{activeServer.name}</span>
                {activeServer.badge && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{activeServer.badge}</span>
                )}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showServers && "rotate-180")} />
              </button>
              {showServers && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-medium uppercase tracking-wider">Switch Server</p>
                  {SERVERS.map((s) => (
                    <button key={s.id} onClick={() => { setActiveServer(s); reload(); setShowServers(false); }}
                      className={cn("w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors", activeServer.id === s.id && "bg-primary/10 text-primary")}>
                      <span>{s.name}</span>
                      {s.badge && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{s.badge}</span>}
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
            {totalSeasons > 1 && (
              <select value={season} onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); reload(); }}
                className="text-sm bg-accent border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>Season {s}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">S{season} E{episode}/{totalEpisodes}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEpisode((e) => Math.max(1, e - 1)); reload(); }} disabled={episode <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEpisode((e) => Math.min(totalEpisodes, e + 1)); reload(); }} disabled={episode >= totalEpisodes}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <button onClick={reload} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground ml-1"><RefreshCw className="h-4 w-4" /></button>
            <button onClick={() => handleClose(false)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            key={`${activeServer.id}-s${season}e${episode}-${iframeKey}`}
            src={activeServer.url(tmdbId, season, episode)}
            title={`${showTitle} S${season}E${episode}`}
            allowFullScreen allow="autoplay; fullscreen; picture-in-picture"
            className="absolute inset-0 w-full h-full"
            referrerPolicy="origin"
          />
        </div>

        <div className="px-3 py-2 bg-background/95 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{showTitle}</span>
            <span className="mx-1.5">·</span>S{season} E{episode}
            <span className="mx-1.5">·</span>{activeServer.name}
          </p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: Math.min(totalEpisodes, 20) }, (_, i) => i + 1).map((ep) => (
              <button key={ep} onClick={() => { setEpisode(ep); reload(); }}
                className={cn("h-7 w-7 text-xs rounded transition-colors",
                  ep === episode ? "bg-primary text-primary-foreground font-bold" : "bg-accent hover:bg-primary/20 text-muted-foreground hover:text-foreground")}>
                {ep}
              </button>
            ))}
            {totalEpisodes > 20 && <span className="text-xs text-muted-foreground self-center ml-1">+{totalEpisodes - 20} more</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
