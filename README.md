# Weather Globe

Live global weather on a 3D Earth — powered by [Open-Meteo](https://open-meteo.com/) (no API key).

**Live:** [https://globe-dashboard-eight.vercel.app](https://globe-dashboard-eight.vercel.app)  
**Source:** [github.com/xalidsabah/globe-dashboard](https://github.com/xalidsabah/globe-dashboard)  
**Version:** `0.1.0` · see [CHANGELOG.md](CHANGELOG.md)

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

```bash
npm run build    # production → dist/
npm run preview  # serve dist locally
npm run lint     # oxlint
npm run ci       # lint + build (same as GitHub Actions)
```

## Deploy

Already on **Vercel** (project `globe-dashboard`). Redeploy:

```bash
vercel --prod --yes
```

Or static host: build, publish `dist/`. No env vars required.

**Custom domain (optional):** Vercel → Project → Settings → Domains → add domain and follow DNS (CNAME/A).

## Source & CI

Repo: **https://github.com/xalidsabah/globe-dashboard**

```bash
git clone https://github.com/xalidsabah/globe-dashboard.git
```

CI (`.github/workflows/ci.yml`) runs **lint + build** on push/PR to `master`/`main`.

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
- Local time · offline indicator · weather-tinted pins · favorite arcs

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

## Release checklist

1. Update [CHANGELOG.md](CHANGELOG.md) under `Unreleased` → new version section  
2. Bump `package.json` `version`  
3. `npm run ci`  
4. Commit, tag: `git tag -a vX.Y.Z -m "vX.Y.Z"`  
5. Push branch + tags; `vercel --prod --yes` if needed  

## Design

See [docs/design-next-phase.md](docs/design-next-phase.md).

## Stack

React 19 · Vite 8 · Three.js · three-globe · React Three Fiber · Tailwind 4 · Vercel
