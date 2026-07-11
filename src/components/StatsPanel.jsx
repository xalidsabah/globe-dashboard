import WeatherIcon from './WeatherIcon'
import { windDir, formatTime } from '../lib/weather'
import useQuietExpand from '../hooks/useQuietExpand'
import { useI18n } from '../i18n/index.jsx'

function temp(c, unit) {
  if (c == null) return '—'
  return unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

function windDisplay(kmh, unit) {
  if (kmh == null) return null
  if (unit === 'F') return { value: Math.round(kmh * 0.621371), unit: 'mph' }
  return { value: Math.round(kmh), unit: 'km/h' }
}

function aqiTone(tone, dark) {
  if (tone === 'good') return dark ? 'text-emerald-400' : 'text-emerald-700'
  if (tone === 'fair') return dark ? 'text-lime-300' : 'text-lime-800'
  if (tone === 'moderate') return dark ? 'text-amber-300' : 'text-amber-700'
  if (tone === 'poor' || tone === 'bad') return dark ? 'text-rose-300' : 'text-rose-700'
  return dark ? 'text-white/55' : 'text-slate-700'
}

export default function StatsPanel({
  weather,
  unit = 'C',
  dark = true,
  onRefresh,
  refreshing,
  error = false,
  hidden,
  hourly = [],
  outdoor = null,
}) {
  const forceOpen = useQuietExpand()
  const { t } = useI18n()
  if (hidden) return null

  const c = weather?.current
  const day = weather?.daily?.[0]
  const air = weather?.air
  const humidity = c?.humidity != null ? Math.round(c.humidity) : null
  const tVal = c?.temp
  const wind = windDisplay(c?.wind, unit)

  const temps = hourly
    .slice(0, 12)
    .map((h) => h.temp)
    .filter((x) => x != null)
  const lo = temps.length ? Math.min(...temps) : 0
  const hi = temps.length ? Math.max(...temps) : 1
  const span = Math.max(0.5, hi - lo)

  const tz = weather?.timezone
  const aqiLabel = air?.labelKey ? t(air.labelKey) : air?.label || ''
  const metrics = [
    {
      label: t('humidity'),
      value: humidity != null ? `${humidity}%` : '—',
    },
    {
      label: t('wind'),
      value: wind ? `${wind.value} ${wind.unit}` : '—',
      sub: c?.windDeg != null ? windDir(c.windDeg) : null,
    },
    {
      label: t('highLow'),
      value: day ? `${temp(day.tMax, unit)}° / ${temp(day.tMin, unit)}°` : '—',
    },
    {
      label: t('uv'),
      value: c?.uv != null ? c.uv.toFixed(1) : day?.uvMax != null ? day.uvMax.toFixed(1) : '—',
    },
    {
      label: t('aqi'),
      value: air?.aqi != null ? `${Math.round(air.aqi)} ${aqiLabel}`.trim() : '—',
      tone: air?.tone,
    },
    {
      label: t('sun'),
      value:
        day?.sunrise && day?.sunset
          ? `${formatTime(day.sunrise, tz)} – ${formatTime(day.sunset, tz)}`
          : '—',
    },
  ]

  const mute = dark ? 'text-white/30' : 'text-slate-600'
  const main = dark ? 'text-white' : 'text-slate-950'

  return (
    <div className="pointer-events-none absolute right-3 top-[30%] z-20 flex -translate-y-1/2 flex-col items-end sm:right-5 fade-in">
      <div
        className={`quiet-panel pointer-events-auto w-[168px] rounded-2xl border px-3.5 py-3 backdrop-blur-md sm:w-[180px] ${
          forceOpen ? 'is-open' : ''
        } ${
          dark
            ? 'border-white/[0.07] bg-black/40'
            : 'border-slate-400/45 bg-white text-slate-900 shadow-md shadow-slate-500/20'
        }`}
      >
        {/* Primary header + temp */}
        <div className="flex items-center justify-between gap-2">
          <div className={`flex min-w-0 items-center gap-1.5 text-[10px] ${mute}`}>
            <span>{t('wx')}</span>
            <span className={dark ? 'text-sky-300/80' : 'text-sky-500'}>
              <WeatherIcon icon={c?.icon || 'cloud'} size={13} isDay={c?.isDay !== false} />
            </span>
            {c?.label && <span className="truncate opacity-90">{c.label}</span>}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title={refreshing ? t('updating') : t('refresh')}
            aria-label={refreshing ? t('updating') : t('refresh')}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
              dark
                ? 'text-white/35 hover:bg-white/8 hover:text-white/80'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              className={refreshing ? 'animate-spin' : ''}
              aria-hidden
            >
              <path
                d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M20 4v5h-5M4 20v-5h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">{refreshing ? t('updating') : t('refresh')}</span>
          </button>
        </div>

        <p className={`mt-3 text-[10px] ${mute}`}>{t('now')}</p>

        {error && !c ? (
          <div className="mt-1 text-right">
            <p className={`text-[12px] ${dark ? 'text-rose-300/80' : 'text-rose-600'}`}>
              {t('couldNotLoadWeather')}
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className={`mt-1 text-[11px] font-medium underline-offset-2 hover:underline ${
                dark ? 'text-white/45' : 'text-slate-800'
              }`}
            >
              {t('retry')}
            </button>
          </div>
        ) : refreshing && !c ? (
          <div className="skeleton mt-1 ml-auto h-9 w-20" />
        ) : (
          <div className="mt-0.5 flex items-start justify-end gap-0.5">
            <span
              className={`text-[36px] font-medium leading-none tracking-tight tabular-nums ${main} ${
                refreshing ? 'opacity-50' : ''
              }`}
            >
              {temp(tVal, unit)}
            </span>
            <span className={`mt-1 text-sm font-normal ${mute}`}>°{unit}</span>
          </div>
        )}

        {/* Secondary: feels + outdoor tip + sparkline + metrics */}
        {c?.feels != null && (
          <p className={`quiet-secondary quiet-gap text-right text-[11px] ${mute}`}>
            {t('feelsLike', { n: temp(c.feels, unit) })}
          </p>
        )}

        {outdoor?.label && (
          <p
            className={`quiet-secondary quiet-gap text-right text-[11px] font-medium leading-snug ${
              dark ? 'text-sky-300/70' : 'text-sky-800'
            }`}
            title={outdoor.condition || t('bestOutdoors', { time: outdoor.label })}
          >
            {outdoor.temp != null
              ? t('outdoorsTemp', { time: outdoor.label, temp: temp(outdoor.temp, unit) })
              : t('outdoors', { time: outdoor.label })}
          </p>
        )}

        {temps.length > 2 && (
          <div
            className="quiet-secondary quiet-gap flex h-7 w-full items-end gap-px opacity-80"
            title="Next 12 hours"
          >
            {temps.map((v, i) => (
              <div
                key={i}
                className={`spark-bar flex-1 rounded-sm ${
                  dark ? 'bg-sky-400/45' : 'bg-sky-600/70'
                }`}
                style={{ height: `${22 + ((v - lo) / span) * 78}%` }}
              />
            ))}
          </div>
        )}

        <ul
          className={`quiet-secondary quiet-rule space-y-1.5 border-t ${
            dark ? 'border-white/5' : 'border-slate-300'
          }`}
        >
          {metrics.map((row) => (
            <li key={row.label} className="flex items-baseline justify-between gap-2 text-right">
              <span className={`text-[10px] font-medium ${mute}`}>{row.label}</span>
              <span
                className={`text-[12px] font-semibold tabular-nums ${
                  row.tone
                    ? aqiTone(row.tone, dark)
                    : dark
                      ? 'text-white/75'
                      : 'text-slate-900'
                }`}
              >
                {row.value}
                {row.sub ? (
                  <span className={`ml-1 text-[10px] ${mute}`}>{row.sub}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
