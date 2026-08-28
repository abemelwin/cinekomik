"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TMDBVideo } from "@/lib/tmdb";

interface TrailerPlayerProps {
  trailer: TMDBVideo;
  movieTitle: string;
}

export function TrailerPlayer({ trailer, movieTitle }: TrailerPlayerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
        <Play className="h-5 w-5 fill-current" />
        Watch Trailer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-border">
          <DialogTitle className="sr-only">{movieTitle} — Trailer</DialogTitle>
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
              title={`${movieTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 hover:bg-black/80 p-1.5 transition-colors"
            aria-label="Close trailer"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
