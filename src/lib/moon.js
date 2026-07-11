export const MOON_PLACE = {
  id: 'special-moon',
  name: 'The Moon',
  country: 'Cislunar space',
  admin1: 'Earth’s satellite',
  lat: 0.674,
  lng: 23.473,
  timezone: 'UTC',
  label: 'The Moon · Earth’s natural satellite',
  body: 'moon',
  isSpecial: true,
}

const MOON_ALIASES = [
  'moon',
  'the moon',
  "earth's moon",
  'earths moon',
  'luna',
  'lunar',
  'selene',
  'apollo',
  'mare',
  'tranquility',
  'tranquillity',
  'cislunar',
]

export function matchMoonQuery(q) {
  if (!q) return false
  const s = String(q).trim().toLowerCase().replace(/\s+/g, ' ')
  if (!s) return false
  if (MOON_ALIASES.some((a) => s === a || s.includes(a))) return true
  if (s.length >= 3 && ('moon'.startsWith(s) || 'luna'.startsWith(s) || 'lunar'.startsWith(s))) {
    return true
  }
  return false
}

export function isMoonPlace(p) {
  return Boolean(p && (p.body === 'moon' || p.id === 'special-moon'))
}

export function lunarPhaseFraction(date = new Date()) {
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0)
  const days = (date.getTime() - ref) / 86400000
  let f = (days / 29.530588853) % 1
  if (f < 0) f += 1
  return f
}

export function lunarPhaseLabel(frac) {
  if (frac < 0.03 || frac > 0.97) return 'New Moon'
  if (frac < 0.22) return 'Waxing Crescent'
  if (frac < 0.28) return 'First Quarter'
  if (frac < 0.47) return 'Waxing Gibbous'
  if (frac < 0.53) return 'Full Moon'
  if (frac < 0.72) return 'Waning Gibbous'
  if (frac < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

export function buildMoonWeather(date = new Date()) {
  const frac = lunarPhaseFraction(date)
  const phase = lunarPhaseLabel(frac)
  const dayBias = Math.sin(frac * Math.PI)
  const surfaceTemp = Math.round(-130 + dayBias * 250)
  const feels = surfaceTemp
  const isDay = dayBias > 0.35
  const icon = isDay ? 'sun' : 'fog'
  const group = isDay ? 'clear' : 'fog'
  const label = isDay ? 'Lunar daylight · vacuum' : 'Lunar night · vacuum'

  const hours = []
  for (let i = 0; i < 24; i++) {
    const t = new Date(date.getTime() + i * 3600 * 1000)
    const f = lunarPhaseFraction(t)
    const bias = Math.sin(f * Math.PI)
    const temp = Math.round(-130 + bias * 250)
    hours.push({
      time: t.toISOString(),
      temp,
      feels: temp,
      humidity: 0,
      precipProb: 0,
      precip: 0,
      code: isDay ? 0 : 45,
      cloud: 0,
      wind: 0,
      isDay: bias > 0.35,
      uv: bias > 0.4 ? 15 : 0,
      label: bias > 0.35 ? 'Vacuum · sunlit' : 'Vacuum · shadow',
      icon: bias > 0.35 ? 'sun' : 'fog',
      group: bias > 0.35 ? 'clear' : 'fog',
    })
  }

  const days = []
  for (let d = 0; d < 7; d++) {
    const t = new Date(date.getTime() + d * 86400000)
    const f = lunarPhaseFraction(t)
    const bias = Math.sin(f * Math.PI)
    const tMax = Math.round(-20 + bias * 140)
    const tMin = Math.round(-160 + bias * 40)
    days.push({
      date: t.toISOString().slice(0, 10),
      code: 0,
      tMax,
      tMin,
      feelsMax: tMax,
      feelsMin: tMin,
      sunrise: null,
      sunset: null,
      uvMax: 15,
      precipSum: 0,
      precipProb: 0,
      windMax: 0,
      gustMax: 0,
      windDir: 0,
      label: lunarPhaseLabel(f),
      icon: bias > 0.45 ? 'sun' : 'fog',
      group: bias > 0.45 ? 'clear' : 'fog',
    })
  }

  return {
    timezone: 'UTC',
    elevation: 0,
    latitude: MOON_PLACE.lat,
    longitude: MOON_PLACE.lng,
    isMoon: true,
    phase,
    phaseFraction: frac,
    units: {},
    current: {
      time: date.toISOString(),
      temp: surfaceTemp,
      feels,
      humidity: 0,
      precip: 0,
      rain: 0,
      snow: 0,
      code: isDay ? 0 : 45,
      cloud: 0,
      pressure: 0,
      wind: 0,
      windGust: 0,
      windDeg: 0,
      isDay,
      uv: isDay ? 15 : 0,
      label,
      icon,
      group,
      moonPhase: phase,
      vacuum: true,
    },
    hourly: hours,
    daily: days,
    air: {
      aqi: null,
      aqiUs: null,
      pm25: 0,
      pm10: 0,
      label: 'N/A · no air',
      labelKey: 'moon_aqi',
      level: 'unknown',
      tone: 'neutral',
    },
    outdoor: null,
    fetchedAt: Date.now(),
  }
}

export function moonOutdoorTip() {
  return {
    time: null,
    label: 'never',
    temp: null,
    precipProb: 0,
    uv: 15,
    condition: 'Spacesuit required — no atmosphere',
    score: 999,
  }
}
