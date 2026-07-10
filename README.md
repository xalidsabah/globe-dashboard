# Weather Globe

Live global weather on a 3D Earth — powered by [Open-Meteo](https://open-meteo.com/) (no API key).

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

```bash
npm run build   # production build
npm run lint    # oxlint
```

## Features

- **3D globe** with day/night textures, city markers, focus fly-to
- **Search** any city (Open-Meteo geocoding) — `/` or `Ctrl/Cmd+K`
- **Current conditions** — temp, feels like, humidity, wind, UV, precip
- **24-hour** + **7-day** forecasts + derived alerts / risk
- **Favorites** (star) + **recent** cities — saved in `localStorage`
- **°C / °F**, light / dark theme, auto-rotate, auto-refresh
- **3D / 2D** camera modes, fullscreen, keyboard shortcuts

## Shortcuts

| Key | Action |
|-----|--------|
| `/` or `Ctrl/Cmd+K` | Search |
| `H` | Hourly panel |
| `D` | 7-day panel |
| `F` | Fullscreen |
| `Esc` | Close / exit |

## Stack

React 19 · Vite 8 · Three.js · three-globe · React Three Fiber · Tailwind 4
