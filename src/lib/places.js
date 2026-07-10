/** Saved places — favorites + recent cities (localStorage) */

export const RECENT_KEY = 'wg-recent-cities'
export const FAVORITES_KEY = 'wg-favorite-cities'

const MAX_RECENT = 8
const MAX_FAVORITES = 16

/** Stable key from coordinates so Paris FR ≠ Paris TX */
export function placeKey(p) {
  if (!p || p.lat == null || p.lng == null) return p?.id || p?.name || ''
  return `${Number(p.lat).toFixed(2)},${Number(p.lng).toFixed(2)}`
}

export function normalizePlace(city) {
  if (!city) return null
  return {
    id: city.id || `city-${city.name}-${placeKey(city)}`,
    name: city.name,
    country: city.country || '',
    admin1: city.admin1 || '',
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone || 'auto',
    label: city.label || [city.name, city.admin1, city.country].filter(Boolean).join(', '),
  }
}

function readList(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(normalizePlace).filter((p) => p?.name && p.lat != null)
  } catch {
    return []
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadRecent() {
  return readList(RECENT_KEY).slice(0, MAX_RECENT)
}

export function pushRecent(place) {
  const p = normalizePlace(place)
  if (!p) return loadRecent()
  const key = placeKey(p)
  const next = [p, ...loadRecent().filter((x) => placeKey(x) !== key)].slice(0, MAX_RECENT)
  writeList(RECENT_KEY, next)
  return next
}

export function clearRecent() {
  writeList(RECENT_KEY, [])
  return []
}

export function loadFavorites() {
  return readList(FAVORITES_KEY).slice(0, MAX_FAVORITES)
}

export function isFavorite(place, favorites = null) {
  const list = favorites ?? loadFavorites()
  const key = placeKey(place)
  if (!key) return false
  return list.some((f) => placeKey(f) === key)
}

/** Returns { list, added } after toggle */
export function toggleFavorite(place) {
  const p = normalizePlace(place)
  if (!p) return { list: loadFavorites(), added: false }
  const key = placeKey(p)
  const prev = loadFavorites()
  const exists = prev.some((f) => placeKey(f) === key)
  let next
  let added
  if (exists) {
    next = prev.filter((f) => placeKey(f) !== key)
    added = false
  } else {
    next = [p, ...prev.filter((f) => placeKey(f) !== key)].slice(0, MAX_FAVORITES)
    added = true
  }
  writeList(FAVORITES_KEY, next)
  return { list: next, added }
}
