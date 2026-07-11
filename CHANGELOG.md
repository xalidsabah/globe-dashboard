# Changelog

All notable changes to **Weather Globe (Global View)** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).  
Versioning follows [SemVer](https://semver.org/).

## [0.1.0] — 2026-07-11

First public release — live on Vercel.

### Added
- 3D weather globe (three-globe / R3F) with day/night textures
- Open-Meteo weather + geocoding (no API key)
- City search, hourly + 7-day forecast, derived alerts / risk
- Favorites + recents + last place (localStorage)
- Use my location (reverse geocode) and share weather
- Quiet minimal UI with hover/focus secondary detail
- Favorite strip + soft arcs between starred cities
- Weather-tinted globe pins
- Offline indicator, weather fetch retry
- Error boundary, OG meta, web app manifest
- Code-split main shell vs globe / modals
- Idle globe prefetch; lower DPR on mobile
- Vercel production deploy config

### Changed
- Demo “Kai / Log out” → Guest + Clear local data
- Keyboard: `/` search, `H` hourly, `D` 7-day, `F` fullscreen, `L` locate, `S` share

### Links
- Live: https://globe-dashboard-eight.vercel.app

## [Unreleased]

### Planned
- GitHub remote + CI green on PR
- Optional custom domain
- Optional AQI / outdoor-window insights
