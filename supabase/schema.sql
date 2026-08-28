-- CineKomik Database Schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- Table: watchlist
-- Stores movies a user wants to watch
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id    TEXT NOT NULL,
  movie_title TEXT NOT NULL,
  poster_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate entries per user/movie
CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_movie_idx
  ON public.watchlist (user_id, movie_id);

-- RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- Table: reading_list
-- Stores manga a user wants to read
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_list (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id    TEXT NOT NULL,
  manga_title TEXT NOT NULL,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS reading_list_user_manga_idx
  ON public.reading_list (user_id, manga_id);

ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reading_list"
  ON public.reading_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own reading_list"
  ON public.reading_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own reading_list"
  ON public.reading_list FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- Table: reading_progress
-- Tracks the last chapter read per manga per user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id       TEXT NOT NULL,
  chapter_id     TEXT NOT NULL,
  chapter_number TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- One progress record per user/manga (upsert target)
CREATE UNIQUE INDEX IF NOT EXISTS reading_progress_user_manga_idx
  ON public.reading_progress (user_id, manga_id);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reading_progress"
  ON public.reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading_progress"
  ON public.reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading_progress"
  ON public.reading_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading_progress"
  ON public.reading_progress FOR DELETE
  USING (auth.uid() = user_id);
