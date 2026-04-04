# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (outputs to dist/)
```

No test runner is configured.

## Architecture

This is a React + TypeScript block-based note-taking app built with Vite, Tailwind CSS v4, and React Router v7.

### State Management

All notes state lives in `src/app/context/NotesContext.tsx`. It exposes `notes`, `isLoading`, and CRUD functions (`createNote`, `deleteNote`, `updateNote`). The app is **local-first**: state updates happen immediately in context, then sync asynchronously to Supabase if env vars are present.

### Core Data Model

```ts
Note: { id, title, blocks[], lastEdited }
Block: { id, type: 'paragraph'|'h1'|'h2'|'h3'|'bullet'|'todo', content, checked? }
```

### Component Hierarchy

```
App.tsx (NotesProvider + RouterProvider)
└── Layout.tsx (responsive sidebar + outlet)
    ├── Sidebar.tsx (note list, new note button)
    └── Home.tsx / Editor.tsx
            └── BlockRow.tsx (individual block with DnD, markdown shortcuts, keyboard nav)
```

### Key Behaviors in BlockRow

- **Markdown shortcuts**: `# ` → H1, `## ` → H2, `### ` → H3, `- `/`* ` → bullet, `[] ` → todo
- **Keyboard nav**: Enter creates new block, Backspace on empty block removes/converts it, Arrow Up/Down moves focus
- **Drag & drop**: React DnD HTML5 backend powers block reordering within a note

### Optional Cloud Sync

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to enable Supabase persistence. Without these, the app runs fully client-side with a default welcome note.
