-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to create the notes table.

create table if not exists public.notes (
  id text primary key,
  title text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  last_edited timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Allow anonymous read/write for development. For production, enable RLS and add policies.
alter table public.notes enable row level security;

create policy "Allow all for now"
  on public.notes
  for all
  using (true)
  with check (true);
