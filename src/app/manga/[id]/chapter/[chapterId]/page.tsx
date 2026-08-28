import { notFound } from "next/navigation";
import { getChapterPages, getMangaChapters } from "@/lib/mangadex";
import { ReaderClient } from "./reader-client";

export const metadata = {
  title: "Reading — CineKomik",
};

interface PageProps {
  params: { id: string; chapterId: string };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { id: mangaId, chapterId } = params;

  let pages: string[] = [];
  let prevChapterId: string | null = null;
  let nextChapterId: string | null = null;
  let chapterNumber: string | null = null;
  let chapterTitle: string | null = null;

  try {
    // Fetch chapter pages and chapter list in parallel
    const [pagesData, chaptersData] = await Promise.all([
      getChapterPages(chapterId),
      getMangaChapters(mangaId, 500, 0),
    ]);

    // Build page URLs — use data-saver for smaller images
    const { baseUrl, chapter } = pagesData;
    pages = chapter.data.map(
      (filename) => `${baseUrl}/data/${chapter.hash}/${filename}`
    );

    // Find adjacent chapters
    const chapters = chaptersData.data.filter(
      (ch) => !ch.attributes.externalUrl
    );

    const idx = chapters.findIndex((ch) => ch.id === chapterId);
    if (idx !== -1) {
      const current = chapters[idx];
      chapterNumber = current.attributes.chapter;
      chapterTitle = current.attributes.title;
      prevChapterId = idx > 0 ? chapters[idx - 1].id : null;
      nextChapterId = idx < chapters.length - 1 ? chapters[idx + 1].id : null;
    }
  } catch {
    notFound();
  }

  if (pages.length === 0) {
    notFound();
  }

  return (
    <ReaderClient
      mangaId={mangaId}
      chapterId={chapterId}
      chapterNumber={chapterNumber}
      chapterTitle={chapterTitle}
      pages={pages}
      prevChapterId={prevChapterId}
      nextChapterId={nextChapterId}
    />
  );
}
