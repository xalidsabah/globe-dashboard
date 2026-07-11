/** Shareable place deep links: ?lat=&lng=&name=&tz=  (+ body=moon) */

import { normalizePlace } from './places'
import { MOON_PLACE, isMoonPlace } from './moon'

export function placeFromSearch(search = typeof window !== 'undefined' ? window.location.search : '') {
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
    if ((q.get('body') || '').toLowerCase() === 'moon') {
      return normalizePlace({ ...MOON_PLACE })
    }
    const lat = Number(q.get('lat'))
    const lng = Number(q.get('lng'))
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
    const name = (q.get('name') || 'Location').trim() || 'Location'
    const country = (q.get('country') || '').trim()
    const timezone = (q.get('tz') || 'auto').trim() || 'auto'
    return normalizePlace({
      id: `url-${lat.toFixed(3)},${lng.toFixed(3)}`,
      name,
      country,
      lat,
      lng,
      timezone,
      label: country ? `${name}, ${country}` : name,
    })
  } catch {
    return null
  }
}

export function writePlaceToUrl(place, { replace = true } = {}) {
  if (typeof window === 'undefined') return
  if (place?.lat == null || place?.lng == null) return
  try {
    const url = new URL(window.location.href)
    if (isMoonPlace(place)) {
      url.searchParams.set('body', 'moon')
      url.searchParams.set('name', place.name || MOON_PLACE.name)
      url.searchParams.delete('lat')
      url.searchParams.delete('lng')
      url.searchParams.delete('country')
      url.searchParams.delete('tz')
    } else {
      url.searchParams.delete('body')
      url.searchParams.set('lat', Number(place.lat).toFixed(4))
      url.searchParams.set('lng', Number(place.lng).toFixed(4))
      url.searchParams.set('name', place.name || 'Location')
      if (place.country) url.searchParams.set('country', place.country)
      else url.searchParams.delete('country')
      if (place.timezone && place.timezone !== 'auto') url.searchParams.set('tz', place.timezone)
      else url.searchParams.delete('tz')
    }
    const next = `${url.pathname}${url.search}${url.hash}`
    if (replace) window.history.replaceState({}, '', next)
    else window.history.pushState({}, '', next)
  } catch {
    /* ignore */
  }
}

export function placeShareUrl(place) {
  if (typeof window === 'undefined' || place?.lat == null || place?.lng == null) {
    return typeof window !== 'undefined' ? window.location.href : ''
  }
  try {
    const url = new URL(window.location.origin + window.location.pathname)
    if (isMoonPlace(place)) {
      url.searchParams.set('body', 'moon')
      url.searchParams.set('name', place.name || MOON_PLACE.name)
      return url.toString()
    }
    url.searchParams.set('lat', Number(place.lat).toFixed(4))
    url.searchParams.set('lng', Number(place.lng).toFixed(4))
    url.searchParams.set('name', place.name || 'Location')
    if (place.country) url.searchParams.set('country', place.country)
    if (place.timezone && place.timezone !== 'auto') url.searchParams.set('tz', place.timezone)
    return url.toString()
  } catch {
    return window.location.href
  }
}
