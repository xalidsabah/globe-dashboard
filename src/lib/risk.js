/**
 * Derived condition risk from Open-Meteo current / hourly / daily.
 * Not official government warnings — clear, actionable signals only.
 */

import { formatHour, windDir } from './weather'

function levelFromScore(score) {
  if (score >= 65) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

/** Next N hours from weather.hourly (already trimmed to upcoming) */
function nextHours(hourly, n = 12) {
  return (hourly || []).slice(0, n)
}

function peakPrecipWindow(hourly) {
  const hrs = nextHours(hourly, 12)
  if (!hrs.length) return null
  let best = null
  for (const h of hrs) {
    const score = (h.precipProb || 0) + (h.precip || 0) * 20
    if (!best || score > best.score) best = { ...h, score }
  }
  if (!best || ((best.precipProb || 0) < 30 && (best.precip || 0) < 0.2)) return null
  return best
}

function highUvHours(hourly) {
  const hrs = nextHours(hourly, 14).filter((h) => (h.uv || 0) >= 6)
  if (!hrs.length) return null
  const peak = hrs.reduce((a, b) => ((b.uv || 0) > (a.uv || 0) ? b : a), hrs[0])
  return { peak, count: hrs.length }
}

/**
 * @returns {{ riskScore, riskLabel, riskStatus, factors, alerts }}
 */
export function evaluateConditions(weather, place) {
  const c = weather?.current
  const day0 = weather?.daily?.[0]
  const hourly = weather?.hourly || []
  const tz = weather?.timezone
  const placeName = place?.name || 'Location'

  if (!c && !day0) {
    return {
      riskScore: 0,
      riskLabel: 'Low',
      riskStatus: 'No data',
      factors: { precip: 0, wind: 0, uv: 0, extreme: 0 },
      alerts: [
        {
          id: 'empty',
          level: 'Low',
          title: 'No location selected',
          detail: 'Select a city to evaluate conditions',
        },
      ],
    }
  }

  let score = 8
  const alerts = []

  // —— Storm / severe weather code ——
  if (c?.group === 'storm' || day0?.group === 'storm') {
    score += 55
    alerts.push({
      id: 'storm',
      level: 'High',
      title: `Thunderstorm risk — ${placeName}`,
      detail: c?.label
        ? `${c.label}. Stay aware of lightning and heavy rain.`
        : 'Storm conditions possible in the forecast window.',
    })
  }

  // —— Precipitation (today + next hours) ——
  const precipPeak = peakPrecipWindow(hourly)
  const dayPrecip = day0?.precipProb ?? 0
  const daySum = day0?.precipSum ?? 0
  let precipFactor = Math.max(dayPrecip, precipPeak?.precipProb || 0)

  if (c?.group === 'rain' || c?.group === 'snow' || c?.group === 'sleet') {
    score += 22
    precipFactor = Math.max(precipFactor, 55)
  }
  if (dayPrecip >= 70 || daySum >= 10) score += 18
  else if (dayPrecip >= 40 || daySum >= 3) score += 10

  if (precipPeak && (precipPeak.precipProb || 0) >= 50) {
    const when = formatHour(precipPeak.time, tz)
    alerts.push({
      id: 'precip-window',
      level: precipPeak.precipProb >= 75 ? 'High' : 'Medium',
      title: 'Precipitation window',
      detail: `${Math.round(precipPeak.precipProb)}% chance around ${when}${
        precipPeak.precip != null ? ` · ~${precipPeak.precip.toFixed(1)} mm` : ''
      }${daySum ? ` · ${daySum} mm today` : ''}`,
    })
  } else if (dayPrecip >= 40) {
    alerts.push({
      id: 'precip-day',
      level: dayPrecip >= 70 ? 'High' : 'Medium',
      title: 'Precipitation',
      detail: `${Math.round(dayPrecip)}% chance today${
        daySum != null ? ` · ${daySum} mm` : ''
      }`,
    })
  } else {
    alerts.push({
      id: 'precip-day',
      level: 'Low',
      title: 'Precipitation',
      detail:
        dayPrecip != null
          ? `${Math.round(dayPrecip)}% chance · ${daySum ?? 0} mm today`
          : 'Low chance of measurable rain',
    })
  }

  // —— Wind / gusts ——
  const wind = c?.wind || 0
  const gust = c?.windGust ?? day0?.gustMax ?? 0
  const windPeak = Math.max(wind, gust, day0?.windMax || 0)
  let windFactor = clamp(windPeak * 1.5)

  if (windPeak >= 70) {
    score += 28
    alerts.push({
      id: 'wind',
      level: 'High',
      title: 'Strong wind',
      detail: `Gusts up to ${Math.round(gust || windPeak)} km/h${
        c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''
      }. Secure loose items outdoors.`,
    })
  } else if (windPeak >= 45) {
    score += 16
    alerts.push({
      id: 'wind',
      level: 'Medium',
      title: 'Elevated wind',
      detail: `Sustained ~${Math.round(wind)} km/h · gusts ${Math.round(gust || windPeak)} km/h${
        c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''
      }`,
    })
  } else {
    alerts.push({
      id: 'wind',
      level: 'Low',
      title: 'Wind',
      detail:
        wind != null
          ? `Sustained ${Math.round(wind)} km/h${
              gust ? ` · gusts ${Math.round(gust)} km/h` : ''
            }${c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''}`
          : '—',
    })
  }

  // —— UV ——
  const uvMax = c?.uv ?? day0?.uvMax ?? 0
  const uvInfo = highUvHours(hourly)
  let uvFactor = clamp((uvMax || 0) * 10)

  if (uvMax >= 8) {
    score += 14
    alerts.push({
      id: 'uv',
      level: uvMax >= 10 ? 'High' : 'Medium',
      title: 'High UV',
      detail: `Max UV ${Number(uvMax).toFixed(1)} today${
        uvInfo?.peak ? ` · peak near ${formatHour(uvInfo.peak.time, tz)}` : ''
      }. Sun protection recommended.`,
    })
  } else if (uvMax >= 6) {
    score += 8
    alerts.push({
      id: 'uv',
      level: 'Medium',
      title: 'UV index',
      detail: `Max UV ${Number(uvMax).toFixed(1)}${
        uvInfo?.peak ? ` · higher around ${formatHour(uvInfo.peak.time, tz)}` : ''
      }`,
    })
  } else {
    alerts.push({
      id: 'uv',
      level: 'Low',
      title: 'UV index',
      detail: uvMax != null ? `Max UV ${Number(uvMax).toFixed(1)} today` : '—',
    })
  }

  // —— Freeze / heat ——
  let extremeFactor = 0
  const tMin = day0?.tMin
  const tMax = day0?.tMax
  if (tMin != null && tMin <= 0) {
    score += 12
    extremeFactor = Math.max(extremeFactor, 40)
    alerts.push({
      id: 'freeze',
      level: tMin <= -5 ? 'High' : 'Medium',
      title: 'Freeze risk',
      detail: `Overnight low ${Math.round(tMin)}°C. Watch for ice on roads and sidewalks.`,
    })
  }
  if (tMax != null && tMax >= 35) {
    score += 14
    extremeFactor = Math.max(extremeFactor, 50)
    alerts.push({
      id: 'heat',
      level: tMax >= 38 ? 'High' : 'Medium',
      title: 'Heat',
      detail: `High ${Math.round(tMax)}°C. Limit midday exposure and hydrate.`,
    })
  }

  // —— Fog ——
  if (c?.group === 'fog') {
    score += 12
    alerts.push({
      id: 'fog',
      level: 'Medium',
      title: 'Fog / low visibility',
      detail: c.label || 'Reduced visibility — drive carefully.',
    })
  }

  // —— Current summary (always first-ish) ——
  alerts.unshift({
    id: 'conditions',
    level: levelFromScore(
      c?.group === 'storm' ? 78 : c?.group === 'rain' || c?.group === 'snow' ? 42 : score
    ),
    title: c ? `${c.label} — ${placeName}` : placeName,
    detail: c
      ? `Wind ${Math.round(c.wind || 0)} km/h ${windDir(c.windDeg)} · Humidity ${Math.round(
          c.humidity || 0
        )}% · Pressure ${Math.round(c.pressure || 0)} hPa`
      : 'Loading conditions…',
  })

  // Deduplicate by id keeping first
  const seen = new Set()
  const unique = []
  for (const a of alerts) {
    if (seen.has(a.id)) continue
    seen.add(a.id)
    unique.push(a)
  }

  const riskScore = clamp(score)
  const riskLabel = levelFromScore(riskScore)
  const riskStatus =
    riskLabel === 'High' ? 'Alert' : riskLabel === 'Medium' ? 'Caution' : 'Stable'

  return {
    riskScore,
    riskLabel,
    riskStatus,
    factors: {
      precip: clamp(precipFactor),
      wind: windFactor,
      uv: uvFactor,
      extreme: extremeFactor,
    },
    alerts: unique,
  }
}
