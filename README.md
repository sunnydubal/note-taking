# Block Notes

A minimal, block-based note-taking app. Notes are made of blocks (headings, paragraphs, bullets, todos). You can reorder blocks by drag and drop and use markdown shortcuts while typing.

## Supabase (optional)

Notes are stored in memory by default. To persist them in Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migration in `supabase/migrations/001_notes.sql` to create the `notes` table.
3. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` – your project URL (Settings → API)
   - `VITE_SUPABASE_ANON_KEY` – your anon/public key
4. Restart the dev server. Notes will load from and save to Supabase. Without these env vars, the app still works with local-only notes.
