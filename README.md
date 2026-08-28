# CineKomik

CineKomik is a responsive entertainment web app for discovering movies and TV shows, browsing manga, and reading chapters in the browser.

## Features

- Browse movies and TV shows powered by TMDB
- Browse MangaDex and Comick.io manga
- Read manga in scroll or page-by-page mode
## Supabase Setup

1. Create a project at [Supabase](https://supabase.com).
2. Copy the project URL and anon key from **Project Settings > API** into `.env.local`.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
4. Add `http://localhost:3000/auth/callback` as an allowed redirect URL in Supabase Auth settings.

Without Supabase credentials, public browsing remains available, but authentication and personal lists will not work.

## Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run Next.js lint checks
```

## Main Routes

- `/` - Home page
- `/movies` - Movie discovery and search
- `/tv` - TV show discovery and search
- `/manga` - Manga discovery
- `/my-list` - Saved movies and manga for signed-in users
- `/login` and `/signup` - Authentication

## Deployment

CineKomik can be deployed to [Vercel](https://vercel.com). Add the same environment variables from `.env.local` to the Vercel project settings before deploying.

Install dependencies:

```bash
npm install
```

Create the local environment file:

```powershell
Copy-Item .env.example .env.local
```

Add your API credentials to `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
