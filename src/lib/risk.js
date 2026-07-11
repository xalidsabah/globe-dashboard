/**
 * Derived condition risk from Open-Meteo current / hourly / daily.
 * Not official government warnings — clear, actionable signals only.
 * Pass `t` from i18n for localized titles/details.
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

const identityT = (k, vars) => {
  if (!vars) return k
  return String(k).replace(/\{(\w+)\}/g, (_, x) => (vars[x] != null ? String(vars[x]) : `{${x}}`))
}

/**
 * @returns {{ riskScore, riskLabel, riskStatus, factors, alerts }}
 */
export function evaluateConditions(weather, place, t = identityT) {
  const c = weather?.current
  const day0 = weather?.daily?.[0]
  const hourly = weather?.hourly || []
  const tz = weather?.timezone
  const placeName = place?.name || t('location')

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
          title: t('alert_noLocation'),
          detail: t('alert_selectCity'),
        },
      ],
    }
  }

  let score = 8
  const alerts = []

  if (c?.group === 'storm' || day0?.group === 'storm') {
    score += 55
    alerts.push({
      id: 'storm',
      level: 'High',
      title: t('alert_storm', { place: placeName }),
      detail: c?.label ? `${c.label}.` : t('alert_stormDetail'),
    })
  }

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
    const mm =
      precipPeak.precip != null ? ` · ~${precipPeak.precip.toFixed(1)} mm` : ''
    const dayBit = daySum ? ` · ${daySum} mm` : ''
    alerts.push({
      id: 'precip-window',
      level: precipPeak.precipProb >= 75 ? 'High' : 'Medium',
      title: t('alert_precipWindow'),
      detail: `${Math.round(precipPeak.precipProb)}% · ${when}${mm}${dayBit}`,
    })
  } else if (dayPrecip >= 40) {
    alerts.push({
      id: 'precip-day',
      level: dayPrecip >= 70 ? 'High' : 'Medium',
      title: t('alert_precip'),
      detail: `${Math.round(dayPrecip)}%${daySum != null ? ` · ${daySum} mm` : ''}`,
    })
  } else {
    alerts.push({
      id: 'precip-day',
      level: 'Low',
      title: t('alert_precip'),
      detail:
        dayPrecip != null
          ? `${Math.round(dayPrecip)}% · ${daySum ?? 0} mm`
          : t('alert_precipLow'),
    })
  }

  const wind = c?.wind || 0
  const gust = c?.windGust ?? day0?.gustMax ?? 0
  const windPeak = Math.max(wind, gust, day0?.windMax || 0)
  let windFactor = clamp(windPeak * 1.5)

  if (windPeak >= 70) {
    score += 28
    alerts.push({
      id: 'wind',
      level: 'High',
      title: t('alert_strongWind'),
      detail: `${Math.round(gust || windPeak)} km/h${
        c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''
      }`,
    })
  } else if (windPeak >= 45) {
    score += 16
    alerts.push({
      id: 'wind',
      level: 'Medium',
      title: t('alert_elevatedWind'),
      detail: `${Math.round(wind)} km/h · ${Math.round(gust || windPeak)} km/h${
        c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''
      }`,
    })
  } else {
    alerts.push({
      id: 'wind',
      level: 'Low',
      title: t('alert_wind'),
      detail:
        wind != null
          ? `${Math.round(wind)} km/h${gust ? ` · ${Math.round(gust)}` : ''}${
              c?.windDeg != null ? ` ${windDir(c.windDeg)}` : ''
            }`
          : '—',
    })
  }

  const uvMax = c?.uv ?? day0?.uvMax ?? 0
  const uvInfo = highUvHours(hourly)
  let uvFactor = clamp((uvMax || 0) * 10)

  if (uvMax >= 8) {
    score += 14
    alerts.push({
      id: 'uv',
      level: uvMax >= 10 ? 'High' : 'Medium',
      title: t('alert_highUv'),
      detail: `UV ${Number(uvMax).toFixed(1)}${
        uvInfo?.peak ? ` · ${formatHour(uvInfo.peak.time, tz)}` : ''
      }`,
    })
  } else if (uvMax >= 6) {
    score += 8
    alerts.push({
      id: 'uv',
      level: 'Medium',
      title: t('alert_uv'),
      detail: `UV ${Number(uvMax).toFixed(1)}${
        uvInfo?.peak ? ` · ${formatHour(uvInfo.peak.time, tz)}` : ''
      }`,
    })
  } else {
    alerts.push({
      id: 'uv',
      level: 'Low',
      title: t('alert_uv'),
      detail: uvMax != null ? `UV ${Number(uvMax).toFixed(1)}` : '—',
    })
  }

  let extremeFactor = 0
  const tMin = day0?.tMin
  const tMax = day0?.tMax
  if (tMin != null && tMin <= 0) {
    score += 12
    extremeFactor = Math.max(extremeFactor, 40)
    alerts.push({
      id: 'freeze',
      level: tMin <= -5 ? 'High' : 'Medium',
      title: t('alert_freeze'),
      detail: `${Math.round(tMin)}°C`,
    })
  }
  if (tMax != null && tMax >= 35) {
    score += 14
    extremeFactor = Math.max(extremeFactor, 50)
    alerts.push({
      id: 'heat',
      level: tMax >= 38 ? 'High' : 'Medium',
      title: t('alert_heat'),
      detail: `${Math.round(tMax)}°C`,
    })
  }

  if (c?.group === 'fog') {
    score += 12
    alerts.push({
      id: 'fog',
      level: 'Medium',
      title: t('alert_fog'),
      detail: c.label || t('alert_fogDetail'),
    })
  }

  const air = weather?.air
  if (air?.aqi != null) {
    const aqi = Number(air.aqi)
    const aqiWord = air.labelKey ? t(air.labelKey) : air.label || ''
    if (aqi > 60) {
      score += aqi > 80 ? 18 : 10
      alerts.push({
        id: 'aqi',
        level: aqi > 80 ? 'High' : 'Medium',
        title: t('alert_aqi'),
        detail: `AQI ${Math.round(aqi)} · ${aqiWord}${
          air.pm25 != null ? ` · PM2.5 ${Math.round(air.pm25)}` : ''
        }`,
      })
    } else {
      alerts.push({
        id: 'aqi',
        level: 'Low',
        title: t('alert_aqi'),
        detail: `AQI ${Math.round(aqi)} · ${aqiWord}${
          air.pm25 != null ? ` · PM2.5 ${Math.round(air.pm25)}` : ''
        }`,
      })
    }
  }

  alerts.unshift({
    id: 'conditions',
    level: levelFromScore(
      c?.group === 'storm' ? 78 : c?.group === 'rain' || c?.group === 'snow' ? 42 : score
    ),
    title: c ? `${c.label} — ${placeName}` : placeName,
    detail: c
      ? `${Math.round(c.wind || 0)} km/h ${windDir(c.windDeg)} · ${Math.round(
          c.humidity || 0
        )}% · ${Math.round(c.pressure || 0)} hPa`
      : t('alert_loading'),
  })

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
