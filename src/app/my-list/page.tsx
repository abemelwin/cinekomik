import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyListClient } from "./my-list-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My List — CineKomik",
  description: "Your saved movies and manga reading list.",
};

export default async function MyListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/my-list");
  }

  // Fetch watchlist and reading list in parallel
  const [watchlistRes, readingListRes, progressRes] = await Promise.all([
    supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reading_list")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", user.id),
  ]);

  const watchlist = watchlistRes.data || [];
  const readingList = readingListRes.data || [];
  const progress = progressRes.data || [];

  // Create a progress map keyed by manga_id
  const progressMap = Object.fromEntries(
    progress.map((p) => [p.manga_id, p])
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">My List</h1>
        <p className="text-muted-foreground">
          Your saved movies and manga
        </p>
      </div>
      <MyListClient
        watchlist={watchlist}
        readingList={readingList}
        progressMap={progressMap}
      />
    </div>
  );
}
