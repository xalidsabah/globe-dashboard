# Design: Weather Globe — Next Phase

**Status:** Ready to implement  
**Baseline:** `b9c5edd` (demo-complete, quiet UI)  
**Goal:** Ship-ready performance and polish without losing the minimal aesthetic.

## Context

The app is a working Open-Meteo weather globe (React + R3F + three-globe). UI is intentionally quiet. Bundle JS is ~2.3 MB mainly due to Three.js loading eagerly with the main shell.

## Goals

1. **Faster first paint** — do not load Three.js until the globe mounts.
2. **Deeper minimalism** — secondary panels recede further; words remain available.
3. **Ship readiness** — meta/error UX and clear deploy notes.

## Non-goals

- Real auth accounts
- Official weather-alert APIs (keep derived risk for now)
- Backend / multi-user sync

## Architecture notes

- Vite + React 19; lazy route-less component split via `React.lazy` + `Suspense`.
- Globe stays a single component; only the import path changes.
- localStorage prefs / favorites stay as-is.

---

## PR Plan

### PR 1: Lazy-load Globe (code-split Three.js)

- **Description:** Dynamically import `Globe` (and thus three / three-globe / R3F canvas usage) so the main shell paints without the 3D stack. Add a quiet loading fallback that matches the minimal UI. Ensure build produces a separate chunk for the globe path.
- **Files/components affected:** `src/App.jsx`, optionally `src/components/GlobeFallback.jsx` (new), `vite.config.js` if chunk naming needed
- **Dependencies:** None

### PR 2: Deeper quiet UI (hover-reveal secondary)

- **Description:** On the main stage, keep place card + core temp visible; recede stats detail and marketing/links to soft hover/focus reveal so the default view is even calmer. Do not remove any copy — progressive disclosure only. Respect `prefers-reduced-motion` and always-visible on touch / when focused for a11y.
- **Files/components affected:** `src/components/LeftPromo.jsx`, `src/components/StatsPanel.jsx`, `src/index.css`
- **Dependencies:** PR 1

### PR 3: Ship polish (meta, errors, deploy docs)

- **Description:** Add a small React error boundary around the app shell, improve Open Graph / social meta in `index.html`, and document deploy (`npm run build` + static host) in README. No new dependencies unless strictly needed.
- **Files/components affected:** `src/main.jsx`, `src/components/ErrorBoundary.jsx` (new), `index.html`, `README.md`
- **Dependencies:** PR 2

---

## Linearized stack

`PR1 → PR2 → PR3`

## Success criteria

- [x] Initial JS payload smaller; globe in its own chunk
- [x] Default UI quieter; all prior words still present (hover/focus/touch reveal)
- [x] Build + lint pass; README has deploy steps
- [x] Error boundary + OG meta + modal code-split + idle globe prefetch
- [x] App still works: search, favorites, forecasts, themes

## Risks

| Risk | Mitigation |
|------|------------|
| Flash of empty globe | Minimal fallback matching stage background |
| Touch users miss hover content | Show secondary on focus / default-expanded on coarse pointer |
| Chunk still large | Acceptable for v1; further split later |

---

*Produced for step-by-step implementation (not Graphite-required).*
