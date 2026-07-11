/** Open-Meteo — free, no API key, accurate global weather */

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'

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

/** Well-known world cities for globe pins + search shortcuts */
export const QUICK_CITIES = [
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin' },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome' },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8509, lng: 174.7645, timezone: 'Pacific/Auckland' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, timezone: 'America/Lima' },
  { name: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721, timezone: 'America/Bogota' },
]
