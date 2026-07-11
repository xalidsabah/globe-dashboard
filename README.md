# Global View

### Live weather on a 3D Earth

Spin the globe, tap a city, get the forecast.  
Free data from [Open-Meteo](https://open-meteo.com/) — **no account, no API key.**

<br />

<p align="center">
  <a href="https://globe-dashboard-eight.vercel.app">
    <img src="https://img.shields.io/badge/Open%20the%20app-Live-0ea5e9?style=for-the-badge" alt="Open the app" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/version-0.1.0-64748b?style=for-the-badge" alt="version" />
  &nbsp;
  <img src="https://img.shields.io/badge/weather-Open--Meteo-22c55e?style=for-the-badge" alt="Open-Meteo" />
</p>

<p align="center">
  <strong><a href="https://globe-dashboard-eight.vercel.app">→ Open Global View in your browser</a></strong>
</p>

---

## What is this?

**Global View** is a weather dashboard built around a real 3D planet — not a list of cities first.

You search or pin a place, the globe flies there, and you see current conditions plus hourly and 7-day outlook. The interface stays quiet so the Earth stays the focus.

Works on desktop and mobile. Dark and light themes. Saves your favorites on this device only.

---

## Try it in 30 seconds

1. **[Open the live app](https://globe-dashboard-eight.vercel.app)**
2. Press **`/`** or tap **Search** → type a city (e.g. Tokyo)
3. Watch the globe focus · read the temp on the card
4. Star ★ a few places · see them along the bottom strip
5. Open the bottom panel for **Hourly**, **7-Day**, and **Alerts**

---

## What you can do

| | |
|---|---|
| **Explore** | Drag the globe · zoom · switch 3D / 2D · fullscreen |
| **Search** | Any city worldwide (geocoding via Open-Meteo) |
| **Locate me** | Use your GPS and jump to nearby weather |
| **Forecast** | Current, next 24 hours, and 7 days |
| **Alerts** | Derived risk: precip windows, UV, wind, freeze/heat, air quality |
| **Air quality** | European AQI + PM2.5 from Open-Meteo |
| **Outdoors** | Suggested best window in the next ~12 hours |
| **Share links** | URL updates with the city so links open the same place |
| **Auto day/night** | Optional theme that follows local sunlight |
| **Languages** | English · Kurdish Kurmanji · Kurdish Sorani (RTL) |
| **Favorites** | Star cities · quick switch · soft arcs on the globe |
| **Share** | Share or copy current conditions |
| **Units & theme** | °C / °F · light / dark · remembers your prefs |

Everything is stored **locally** in your browser (favorites, last city, settings).  
**Clear local data** from the Guest menu if you want a reset.

---

## Controls

### Mouse / touch
- **Drag** — rotate Earth  
- **Scroll / pinch** — zoom  
- **Tap city pin or search result** — focus + weather  
- **Hover** left/right panels (desktop) — extra details  

### Keyboard

| Key | Action |
|:---:|--------|
| `/` or `⌘/Ctrl + K` | Search |
| `H` | Hourly forecast |
| `D` | 7-day forecast |
| `F` | Fullscreen |
| `L` | Use my location |
| `S` | Share weather |
| `?` | Keyboard shortcuts help |
| `Esc` | Close panels / exit fullscreen |

---

## Privacy & data

- Weather and geocoding come from **Open-Meteo** (public free API).
- **No login** required for weather.
- Favorites and settings stay on **your device**.
- “Guest” is not a real account — it’s local-only.

---

## Run it yourself

If you want to develop or host your own copy:

```bash
git clone https://github.com/xalidsabah/globe-dashboard.git
cd globe-dashboard
npm install
npm run dev
```

Then open **http://127.0.0.1:5173**

```bash
npm run build     # production build → dist/
npm run preview   # preview the build
npm run ci        # lint + build (same as GitHub Actions)
```

### Deploy

Static site — upload `dist/` anywhere, or:

```bash
vercel --prod --yes
```

No environment variables needed.

---

## Stack

React 19 · Vite · Three.js · React Three Fiber · three-globe · Tailwind · Vercel  

Changelog: [CHANGELOG.md](CHANGELOG.md)

---

<p align="center">
  <a href="https://globe-dashboard-eight.vercel.app"><strong>Open the live app →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/xalidsabah/globe-dashboard">Source</a>
</p>
