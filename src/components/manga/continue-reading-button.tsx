"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

interface ContinueReadingButtonProps {
  mangaId: string;
  firstChapterId?: string;
}

export function ContinueReadingButton({ mangaId, firstChapterId }: ContinueReadingButtonProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{
    chapter_id: string;
    chapter_number: string | null;
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reading_progress")
      .select("chapter_id, chapter_number")
      .eq("user_id", user.id)
      .eq("manga_id", mangaId)
      .maybeSingle()
      .then(({ data }) => setProgress(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mangaId]);

  const targetChapterId = progress?.chapter_id || firstChapterId;
  if (!targetChapterId) return null;

  return (
    <Button asChild size="lg" className="gap-2">
      <Link href={`/manga/${mangaId}/chapter/${targetChapterId}`}>
        <Play className="h-4 w-4 fill-current" />
        {progress
          ? `Continue Ch. ${progress.chapter_number || ""}`
          : "Start Reading"}
      </Link>
    </Button>
  );
}
