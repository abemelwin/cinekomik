"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  posterUrl: string | null;
}

export function WatchlistButton({ movieId, movieTitle, posterUrl }: WatchlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("movie_id", String(movieId))
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, movieId]);

  const toggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    if (saved) {
      await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", String(movieId));
      setSaved(false);
    } else {
      await supabase.from("watchlist").insert({
        user_id: user.id,
        movie_id: String(movieId),
        movie_title: movieTitle,
        poster_url: posterUrl,
      });
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="lg"
      onClick={toggle}
      disabled={loading}
      className={cn("gap-2", saved && "border-primary/50")}
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", saved && "fill-primary text-primary")}
      />
      {saved ? "Saved" : "Add to Watchlist"}
    </Button>
  );
}
