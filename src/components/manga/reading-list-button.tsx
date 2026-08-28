"use client";

import { useState, useEffect } from "react";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ReadingListButtonProps {
  mangaId: string;
  mangaTitle: string;
  coverUrl: string;
}

export function ReadingListButton({ mangaId, mangaTitle, coverUrl }: ReadingListButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reading_list")
      .select("id")
      .eq("user_id", user.id)
      .eq("manga_id", mangaId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mangaId]);

  const toggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    if (saved) {
      await supabase
        .from("reading_list")
        .delete()
        .eq("user_id", user.id)
        .eq("manga_id", mangaId);
      setSaved(false);
    } else {
      await supabase.from("reading_list").insert({
        user_id: user.id,
        manga_id: mangaId,
        manga_title: mangaTitle,
        cover_url: coverUrl,
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
      <BookMarked
        className={cn("h-5 w-5 transition-colors", saved && "fill-primary text-primary")}
      />
      {saved ? "In Reading List" : "Add to Reading List"}
    </Button>
  );
}
