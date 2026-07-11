/** Saved places — favorites + recent cities (localStorage) */

export const RECENT_KEY = 'wg-recent-cities'
export const FAVORITES_KEY = 'wg-favorite-cities'
export const LAST_PLACE_KEY = 'wg-last-place'

const MAX_RECENT = 8
const MAX_FAVORITES = 16

function toNum(n) {
  const v = Number(n)
  return Number.isFinite(v) ? v : null
}

/** Stable key from coordinates so Paris FR ≠ Paris TX */
export function placeKey(p) {
  if (!p) return ''
  const lat = toNum(p.lat)
  const lng = toNum(p.lng)
  if (lat == null || lng == null) return String(p.id || p.name || '')
  return `${lat.toFixed(2)},${lng.toFixed(2)}`
}

export function samePlace(a, b) {
  if (!a || !b) return false
  return placeKey(a) === placeKey(b)
}

export function normalizePlace(city) {
  if (!city?.name) return null
  const lat = toNum(city.lat)
  const lng = toNum(city.lng)
  if (lat == null || lng == null) return null

  const admin1 = city.admin1 || ''
  const country = city.country || ''
  const label =
    city.label ||
    [city.name, admin1, country].filter(Boolean).join(', ')

  return {
    id: city.id || `city-${city.name}-${lat.toFixed(2)},${lng.toFixed(2)}`,
    name: String(city.name).trim(),
    country,
    admin1,
    lat,
    lng,
    timezone: city.timezone || 'auto',
    label,
  }
}

function dedupeByKey(list) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    const k = placeKey(item)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

function readList(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(raw)) return []
    return dedupeByKey(raw.map(normalizePlace).filter(Boolean))
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

export function loadLastPlace() {
  try {
    return normalizePlace(JSON.parse(localStorage.getItem(LAST_PLACE_KEY) || 'null'))
  } catch {
    return null
  }
}

export function saveLastPlace(place) {
  const p = normalizePlace(place)
  if (!p) return
  try {
    localStorage.setItem(LAST_PLACE_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
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

  const next = exists
    ? prev.filter((f) => placeKey(f) !== key)
    : [p, ...prev.filter((f) => placeKey(f) !== key)].slice(0, MAX_FAVORITES)

  writeList(FAVORITES_KEY, next)
  return { list: next, added: !exists }
}
