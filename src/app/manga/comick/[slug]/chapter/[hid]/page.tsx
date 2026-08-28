import { notFound } from "next/navigation";
import {
  getComickChapterPages,
  getComickChapters,
  getComickPageUrl,
} from "@/lib/comick";
import { ComickReaderClient } from "./reader-client";

export const metadata = { title: "Reading — CineKomik" };

interface PageProps {
  params: { slug: string; hid: string };
}

export default async function ComickChapterPage({ params }: PageProps) {
  const { slug, hid } = params;

  let pages: string[] = [];
  let prevHid: string | null = null;
  let nextHid: string | null = null;
  let chapterNum: string | null = null;
  let chapterTitle: string | null = null;

  try {
    const [chapterRes, chaptersRes] = await Promise.all([
      getComickChapterPages(hid),
      getComickChapters(slug, 500, 1),
    ]);

    // Build page URLs
    pages = (chapterRes.chapter.md_images ?? []).map(getComickPageUrl);
    chapterNum   = chapterRes.chapter.chap;
    chapterTitle = chapterRes.chapter.title;

    // Find adjacent chapters
    const allChapters = chaptersRes.chapters ?? [];
    const idx = allChapters.findIndex((c) => c.hid === hid);
    if (idx !== -1) {
      prevHid = idx > 0                     ? allChapters[idx - 1].hid : null;
      nextHid = idx < allChapters.length - 1 ? allChapters[idx + 1].hid : null;
    }
  } catch {
    notFound();
  }

  if (pages.length === 0) notFound();

  return (
    <ComickReaderClient
      slug={slug}
      chapterNum={chapterNum}
      chapterTitle={chapterTitle}
      pages={pages}
      prevHid={prevHid}
      nextHid={nextHid}
    />
  );
}
