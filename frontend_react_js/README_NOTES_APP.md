# Quick Notes - Rainbow Burst

A lightweight, playful single-page notes app built with React. It features:
- Sidebar with search/filter and keyboard navigation
- Main editor with debounced autosave
- Create, edit, delete notes
- Rainbow Burst theme with lively gradients and rounded corners
- Persistence via Supabase (if configured) or localStorage fallback
- Friendly toasts and basic error handling
- Accessibility: listbox navigation, focus styles, ARIA attributes

## Getting Started

1. Install dependencies:
   npm install

2. Create a .env file (optional for Supabase). You can start from .env.example:
   cp .env.example .env

3. Start the dev server:
   npm start
   Open http://localhost:3000 in your browser.

## Environment Variables

- REACT_APP_SUPABASE_URL: Supabase project URL (optional)
- REACT_APP_SUPABASE_KEY: Supabase anon key (optional)

If these are absent, the app uses localStorage automatically.

Other optional variables passed through from the environment:
- REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

## Supabase Notes Table

If using Supabase, ensure a `notes` table exists:

Columns:
- id: text (primary key)
- title: text
- content: text
- tags: json (optional)
- updated_at: timestamptz

RLS: allow read/write for anon if unauthenticated demo, or set appropriate auth policies for your environment.

## Keyboard Shortcuts

- Sidebar (focused):
  - Arrow Up/Down: Navigate notes
  - Enter/Space: Select note
  - Delete/Backspace: Delete selected note

## Testing

Run tests:
  npm test

## Security

- No secrets are hardcoded
- Env vars used for Supabase
- Do not commit real keys to version control
