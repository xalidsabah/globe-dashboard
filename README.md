# Weather Globe

Live global weather on a 3D Earth — powered by [Open-Meteo](https://open-meteo.com/) (no API key).

**Live:** [https://globe-dashboard-eight.vercel.app](https://globe-dashboard-eight.vercel.app)

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
npm run lint     # oxlint
```

## Deploy

Static site — any host that serves `dist/`:

```bash
npm run build
```

Then publish the `dist` folder to:

- **Vercel / Netlify / Cloudflare Pages** — connect the repo or drag `dist`
- **GitHub Pages** — set root to `dist` (or use an action)
- **Any CDN / nginx** — serve `dist` as static files

No env vars or API keys required.

SPA note: if the host rewrites unknown paths, point them to `index.html` (default for most static hosts).

## Features

- **3D globe** (code-split) with day/night textures, city markers, focus fly-to
- **Search** any city — `/` or `Ctrl/Cmd+K`
- **Current conditions** — temp, feels like, humidity, wind, UV
- **24-hour** + **7-day** forecasts + derived alerts / risk
- **Favorites** (star) + **recent** cities — `localStorage`
- **°C / °F**, light / dark, auto-rotate, auto-refresh
- **3D / 2D**, fullscreen, keyboard shortcuts
- Quiet UI — secondary detail on hover / focus / touch
- **Use my location** + **share** weather · remembers last city
- Local time for the selected place · offline indicator

## Shortcuts

| Key | Action |
|-----|--------|
| `/` or `Ctrl/Cmd+K` | Search |
| `H` | Hourly panel |
| `D` | 7-day panel |
| `F` | Fullscreen |
| `L` | Use my location |
| `S` | Share weather |
| `Esc` | Close / exit |

## Design

See [docs/design-next-phase.md](docs/design-next-phase.md) for the next-phase PR plan.

## Stack

React 19 · Vite 8 · Three.js · three-globe · React Three Fiber · Tailwind 4
