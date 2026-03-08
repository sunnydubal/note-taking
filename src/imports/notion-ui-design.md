Design an aesthetically pleasing, minimal note-taking web app UI inspired by Notion (desktop-first, mobile responsive). The core experience is a block-based editor where each block has a consistent six-dot drag handle (like Notion) for reordering. Important: use ONLY the following block types—nothing else:

- Paragraph block
- To-do block (checkbox)
- Bulleted list item block
- Heading 1 block
- Heading 2 block
- Heading 3 block

Style direction

- Overall vibe: modern, minimal, “Notion-like” spacing and clarity.
- Color palette: black/near-black base with a “cosmic orange” accent.
    - Background: deep charcoal/black
    - Surfaces: slightly lighter charcoal for cards/panels
    - Text: off-white for primary, muted gray for secondary
    - Accent: cosmic orange for primary actions, focus rings, and subtle highlights
    - Use one additional supporting color only if needed (e.g., a cool gray or subtle violet) but keep it restrained.
- Typography: clean sans-serif with clear hierarchy for H1/H2/H3.

Layout / screens

1) Notes list (Home)

- Left-aligned app header (logo/name: “Block Notes”).
- Primary CTA: “New note” (cosmic orange button).
- Notes list: simple vertical list with title + last edited.
- Empty state: friendly illustration-free empty state with text and “Create your first note”.

2) Note editor (Main)

- Layout: Notion-like editor canvas centered with generous margins.
- Optional two-pane desktop layout:
    - Left sidebar: notes list
    - Right/main: editor
- Note title at top (large, editable).

Block editor requirements (very specific)

- Every block row is aligned to a consistent left edge.
- Each block row contains, from left to right:
    
    1) Six-dot drag handle (exactly six dots in a 2x3 grid). No arrows. No mixed icons.
    
    2) Block content area (text / checkbox + text depending on type)
    
- Drag handle behavior:
    - Default: subtle (muted gray)
    - Hover/focus: becomes more visible + cosmic orange highlight
- Blocks should have a hover state (very subtle background) and a focused state (thin cosmic orange outline or left accent bar).
- Spacing: Notion-like vertical rhythm; blocks are easy to scan.

Block designs

- Paragraph: multi-line text, comfortable line height.
- Heading 1/2/3: visually distinct sizes and weight, but still minimal.
- Bulleted list item: bullet dot aligned with text baseline; treat each bullet as its own block row with the drag handle.
- To-do item: checkbox aligned with text baseline; checked state uses subtle strikethrough + muted text.

Interactions to represent in the design

- Hover block row (drag handle appears stronger)
- Focused block row (active outline/accent)
- Dragging state (block lifts with shadow; placeholder line)
- Empty note state: a single placeholder paragraph like “Type / to insert blocks” (just as hint text; do not add other block types)

Mobile responsive behavior

- Sidebar collapses into a notes drawer.
- Editor remains centered with smaller margins.
- Drag handle remains visible and aligned (tap-friendly).

Deliverables

- High-fidelity frames:
    - Notes list — Desktop
    - Note editor — Desktop
    - Note editor (with several mixed blocks) — Desktop
    - Notes list — Mobile
    - Note editor — Mobile
- Component set:
    - Drag handle (six dots)
    - Block row container (default/hover/focus/dragging)
    - Paragraph, H1, H2, H3, Bullet item, To-do item
    - Buttons (primary/secondary)

Name the frames clearly (e.g., “Notes List — Desktop”, “Editor — Desktop”, “Editor — Mobile”).