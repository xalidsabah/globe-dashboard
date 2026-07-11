/** Open-Meteo — free, no API key, accurate global weather */

import { capitalPinRows, isCapitalPlace } from './capitals'

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export const WMO = {
  0: { label: 'Clear sky', icon: 'sun', group: 'clear' },
  1: { label: 'Mainly clear', icon: 'sun', group: 'clear' },
  2: { label: 'Partly cloudy', icon: 'partly', group: 'cloud' },
  3: { label: 'Overcast', icon: 'cloud', group: 'cloud' },
  45: { label: 'Fog', icon: 'fog', group: 'fog' },
  48: { label: 'Rime fog', icon: 'fog', group: 'fog' },
  51: { label: 'Light drizzle', icon: 'drizzle', group: 'rain' },
  53: { label: 'Drizzle', icon: 'drizzle', group: 'rain' },
  55: { label: 'Heavy drizzle', icon: 'drizzle', group: 'rain' },
  56: { label: 'Freezing drizzle', icon: 'sleet', group: 'snow' },
  57: { label: 'Heavy freezing drizzle', icon: 'sleet', group: 'snow' },
  61: { label: 'Slight rain', icon: 'rain', group: 'rain' },
  63: { label: 'Rain', icon: 'rain', group: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain', group: 'rain' },
  66: { label: 'Freezing rain', icon: 'sleet', group: 'snow' },
  67: { label: 'Heavy freezing rain', icon: 'sleet', group: 'snow' },
  71: { label: 'Slight snow', icon: 'snow', group: 'snow' },
  73: { label: 'Snow', icon: 'snow', group: 'snow' },
  75: { label: 'Heavy snow', icon: 'snow', group: 'snow' },
  77: { label: 'Snow grains', icon: 'snow', group: 'snow' },
  80: { label: 'Rain showers', icon: 'rain', group: 'rain' },
  81: { label: 'Rain showers', icon: 'rain', group: 'rain' },
  82: { label: 'Violent rain showers', icon: 'rain', group: 'rain' },
  85: { label: 'Snow showers', icon: 'snow', group: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'snow', group: 'snow' },
  95: { label: 'Thunderstorm', icon: 'storm', group: 'storm' },
  96: { label: 'Thunderstorm + hail', icon: 'storm', group: 'storm' },
  99: { label: 'Thunderstorm + heavy hail', icon: 'storm', group: 'storm' },
}

export function wmoInfo(code) {
  return WMO[code] || { label: 'Unknown', icon: 'cloud', group: 'cloud' }
}

export function windDir(deg) {
  if (deg == null || Number.isNaN(deg)) return '—'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function formatHour(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      timeZone: timeZone || undefined,
    }).format(new Date(iso))
  } catch {
    return iso?.slice(11, 16) || ''
  }
}

export function formatDay(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timeZone || undefined,
    }).format(new Date(iso))
  } catch {
    return iso?.slice(0, 10) || ''
  }
}

export function formatTime(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timeZone || undefined,
    }).format(new Date(iso))
  } catch {
    return iso?.slice(11, 16) || ''
  }
}

export async function searchPlaces(query, count = 6) {
  if (!query || query.trim().length < 2) return []
  const url = new URL(GEOCODE)
  url.searchParams.set('name', query.trim())
  url.searchParams.set('count', String(count))
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  return (data.results || []).map((r) => ({
    id: `${r.id ?? r.latitude}-${r.longitude}`,
    name: r.name,
    admin1: r.admin1 || '',
    country: r.country || '',
    countryCode: r.country_code || '',
    lat: r.latitude,
    lng: r.longitude,
    timezone: r.timezone || 'UTC',
    population: r.population,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  }))
}

/** Reverse geocode lat/lng → place (Open-Meteo) */
export async function reverseGeocode(lat, lng) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  url.searchParams.set('count', '1')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Reverse geocoding failed')
  const data = await res.json()
  const r = data.results?.[0]
  if (!r) {
    return {
      id: `geo-${lat.toFixed(2)},${lng.toFixed(2)}`,
      name: 'Your location',
      admin1: '',
      country: '',
      lat,
      lng,
      timezone: 'auto',
      label: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
    }
  }
  return {
    id: `${r.id ?? r.latitude}-${r.longitude}`,
    name: r.name || 'Your location',
    admin1: r.admin1 || '',
    country: r.country || '',
    countryCode: r.country_code || '',
    lat: r.latitude ?? lat,
    lng: r.longitude ?? lng,
    timezone: r.timezone || 'auto',
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', ') || 'Your location',
  }
}

async function fetchWithRetry(url, { retries = 2, timeoutMs = 12000 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (e) {
      clearTimeout(timer)
      lastErr = e
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      }
    }
  }
  throw lastErr || new Error('Network failed')
}

/** European AQI bands (Open-Meteo consolidated index). labelKey for i18n. */
export function aqiLabel(aqi) {
  if (aqi == null || Number.isNaN(aqi)) {
    return { label: '—', labelKey: null, level: 'unknown', tone: 'neutral' }
  }
  const n = Number(aqi)
  if (n <= 20) return { label: 'Good', labelKey: 'aqi_good', level: 'good', tone: 'good' }
  if (n <= 40) return { label: 'Fair', labelKey: 'aqi_fair', level: 'fair', tone: 'fair' }
  if (n <= 60)
    return { label: 'Moderate', labelKey: 'aqi_moderate', level: 'moderate', tone: 'moderate' }
  if (n <= 80) return { label: 'Poor', labelKey: 'aqi_poor', level: 'poor', tone: 'poor' }
  if (n <= 100)
    return { label: 'Very poor', labelKey: 'aqi_very_poor', level: 'very_poor', tone: 'bad' }
  return { label: 'Extreme', labelKey: 'aqi_extreme', level: 'extreme', tone: 'bad' }
}

export async function fetchAirQuality(lat, lng) {
  const url = new URL(AIR_QUALITY)
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set(
    'current',
    ['european_aqi', 'pm2_5', 'pm10', 'us_aqi'].join(',')
  )
  url.searchParams.set('timezone', 'auto')
  try {
    const res = await fetchWithRetry(url, { retries: 1, timeoutMs: 10000 })
    const data = await res.json()
    const cur = data.current || {}
    const aqi = cur.european_aqi ?? cur.us_aqi ?? null
    const meta = aqiLabel(aqi)
    return {
      aqi,
      aqiUs: cur.us_aqi ?? null,
      pm25: cur.pm2_5 ?? null,
      pm10: cur.pm10 ?? null,
      ...meta,
      time: cur.time,
    }
  } catch {
    return null
  }
}

/** Weather + air quality in parallel (AQ failure is non-fatal) */
export async function fetchWeatherBundle(lat, lng, timezone = 'auto') {
  const [weather, air] = await Promise.all([
    fetchWeather(lat, lng, timezone),
    fetchAirQuality(lat, lng),
  ])
  return { ...weather, air }
}

/**
 * Best outdoor window in next 12 hours: low precip, mild wind, reasonable UV/temp.
 * Returns null if no decent hour.
 */
export function bestOutdoorWindow(hourly, timeZone) {
  const hrs = (hourly || []).slice(0, 12)
  if (!hrs.length) return null

  let best = null
  for (const h of hrs) {
    const precip = h.precipProb ?? 0
    const wind = h.wind ?? 0
    const uv = h.uv ?? 0
    const temp = h.temp
    const badGroup = h.group === 'storm' || h.group === 'snow'
    if (badGroup) continue
    if (precip > 55) continue
    if (wind > 50) continue
    // score: lower is better
    let score = precip * 1.2 + wind * 0.5 + Math.max(0, uv - 7) * 8
    if (temp != null) {
      if (temp < 5 || temp > 32) score += 25
      else if (temp >= 14 && temp <= 26) score -= 8
    }
    if (h.group === 'clear') score -= 6
    if (h.group === 'rain') score += 15
    if (!best || score < best.score) best = { ...h, score }
  }
  if (!best || best.score > 70) return null
  return {
    time: best.time,
    label: formatHour(best.time, timeZone),
    temp: best.temp,
    precipProb: best.precipProb,
    uv: best.uv,
    condition: best.label,
    score: best.score,
  }
}

export async function fetchWeather(lat, lng, timezone = 'auto') {
  const url = new URL(FORECAST)
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('timezone', timezone)
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(',')
  )
  url.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'is_day',
      'uv_index',
    ].join(',')
  )
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(',')
  )
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('wind_speed_unit', 'kmh')

  const res = await fetchWithRetry(url)
  const data = await res.json()
  return normalizeWeather(data)
}

/** Batch current temps for many cities — never overwrite lat/lng from API */
export async function fetchCitiesSnapshot(cities) {
  if (!cities?.length) return []
  const lats = cities.map((c) => c.lat).join(',')
  const lngs = cities.map((c) => c.lng).join(',')
  const url = new URL(FORECAST)
  url.searchParams.set('latitude', lats)
  url.searchParams.set('longitude', lngs)
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Cities snapshot failed')
  const data = await res.json()
  // Open-Meteo multi-location: array; single: object
  const rows = Array.isArray(data) ? data : [data]

  return cities.map((city, i) => {
    const row = rows[i] ?? null
    const cur = row?.current || {}
    const info = cur.weather_code != null ? wmoInfo(cur.weather_code) : {}
    // Keep original coords always — API lat/lng can differ slightly / re-order
    return {
      ...city,
      id: city.id || `city-${city.name}`,
      lat: city.lat,
      lng: city.lng,
      temp: cur.temperature_2m ?? city.temp,
      code: cur.weather_code ?? city.code,
      isDay: cur.is_day === 1,
      icon: info.icon || city.icon,
      group: info.group || city.group,
      // do NOT spread weather "label" over city label
      weatherLabel: info.label,
      label: city.label || `${city.name}, ${city.country}`,
    }
  })
}

function normalizeWeather(data) {
  const tz = data.timezone
  const cur = data.current || {}
  const hourly = data.hourly || {}
  const daily = data.daily || {}
  const units = {
    ...data.current_units,
    ...data.hourly_units,
    ...data.daily_units,
  }

  const now = cur.time ? new Date(cur.time).getTime() : Date.now()
  const hours = (hourly.time || [])
    .map((t, i) => ({
      time: t,
      temp: hourly.temperature_2m?.[i],
      feels: hourly.apparent_temperature?.[i],
      humidity: hourly.relative_humidity_2m?.[i],
      precipProb: hourly.precipitation_probability?.[i],
      precip: hourly.precipitation?.[i],
      code: hourly.weather_code?.[i],
      cloud: hourly.cloud_cover?.[i],
      wind: hourly.wind_speed_10m?.[i],
      isDay: hourly.is_day?.[i] === 1,
      uv: hourly.uv_index?.[i],
      ...wmoInfo(hourly.weather_code?.[i]),
    }))
    .filter((h) => new Date(h.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, 24)

  const days = (daily.time || []).map((t, i) => ({
    date: t,
    code: daily.weather_code?.[i],
    tMax: daily.temperature_2m_max?.[i],
    tMin: daily.temperature_2m_min?.[i],
    feelsMax: daily.apparent_temperature_max?.[i],
    feelsMin: daily.apparent_temperature_min?.[i],
    sunrise: daily.sunrise?.[i],
    sunset: daily.sunset?.[i],
    uvMax: daily.uv_index_max?.[i],
    precipSum: daily.precipitation_sum?.[i],
    precipProb: daily.precipitation_probability_max?.[i],
    windMax: daily.wind_speed_10m_max?.[i],
    gustMax: daily.wind_gusts_10m_max?.[i],
    windDir: daily.wind_direction_10m_dominant?.[i],
    ...wmoInfo(daily.weather_code?.[i]),
  }))

  const current = {
    time: cur.time,
    temp: cur.temperature_2m,
    feels: cur.apparent_temperature,
    humidity: cur.relative_humidity_2m,
    precip: cur.precipitation,
    rain: cur.rain,
    snow: cur.snowfall,
    code: cur.weather_code,
    cloud: cur.cloud_cover,
    pressure: cur.pressure_msl ?? cur.surface_pressure,
    wind: cur.wind_speed_10m,
    windGust: cur.wind_gusts_10m,
    windDeg: cur.wind_direction_10m,
    isDay: cur.is_day === 1,
    ...wmoInfo(cur.weather_code),
  }

  const uvNow = hours[0]?.uv ?? days[0]?.uvMax ?? null

  return {
    timezone: tz,
    elevation: data.elevation,
    latitude: data.latitude,
    longitude: data.longitude,
    units,
    current: { ...current, uv: uvNow },
    hourly: hours,
    daily: days,
    fetchedAt: Date.now(),
  }
}

/** Major metros + regional hubs for globe pins (capitals merged separately) */
const METRO_CITIES = [
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8509, lng: 174.7645, timezone: 'Pacific/Auckland' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, timezone: 'America/Sao_Paulo' },
]

function mergeCityLists(...lists) {
  const byKey = new Map()
  for (const list of lists) {
    for (const c of list || []) {
      if (c?.lat == null || c?.lng == null) continue
      const key = `${Number(c.lat).toFixed(2)},${Number(c.lng).toFixed(2)}`
      const prev = byKey.get(key)
      const isCap = c.isCapital || isCapitalPlace(c)
      byKey.set(key, {
        ...prev,
        ...c,
        id: c.id || prev?.id || `city-${c.name}`,
        isCapital: Boolean(isCap || prev?.isCapital),
        label: c.label || prev?.label || [c.name, c.country].filter(Boolean).join(', '),
      })
    }
  }
  return Array.from(byKey.values())
}

/** Well-known world cities for globe pins + search shortcuts (includes capitals) */
export const QUICK_CITIES = mergeCityLists(capitalPinRows(), METRO_CITIES)
