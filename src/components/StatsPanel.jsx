import WeatherIcon from './WeatherIcon'
import { windDir } from '../lib/weather'

function temp(c, unit) {
  if (c == null) return '—'
  return unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

function windDisplay(kmh, unit) {
  if (kmh == null) return null
  if (unit === 'F') return { value: Math.round(kmh * 0.621371), unit: 'mph' }
  return { value: Math.round(kmh), unit: 'km/h' }
}

export default function StatsPanel({
  weather,
  unit = 'C',
  dark = true,
  onRefresh,
  refreshing,
  hidden,
  hourly = [],
}) {
  if (hidden) return null

  const c = weather?.current
  const day = weather?.daily?.[0]
  const humidity = c?.humidity != null ? Math.round(c.humidity) : null
  const t = c?.temp
  const wind = windDisplay(c?.wind, unit)

  const temps = hourly
    .slice(0, 12)
    .map((h) => h.temp)
    .filter((x) => x != null)
  const lo = temps.length ? Math.min(...temps) : 0
  const hi = temps.length ? Math.max(...temps) : 1
  const span = Math.max(0.5, hi - lo)

  const metrics = [
    {
      label: 'Humidity',
      value: humidity != null ? `${humidity}%` : '—',
    },
    {
      label: 'Wind',
      value: wind ? `${wind.value} ${wind.unit}` : '—',
      sub: c?.windDeg != null ? windDir(c.windDeg) : null,
    },
    {
      label: 'High / Low',
      value: day ? `${temp(day.tMax, unit)}° / ${temp(day.tMin, unit)}°` : '—',
    },
    {
      label: 'UV',
      value: c?.uv != null ? c.uv.toFixed(1) : day?.uvMax != null ? day.uvMax.toFixed(1) : '—',
    },
  ]

  return (
    <div className="pointer-events-none absolute right-3 top-[28%] z-20 flex -translate-y-1/2 flex-col items-end gap-2.5 sm:right-5 sm:top-[30%] sm:gap-3 fade-in">
      <div
        className={`glass-soft flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium ${
          dark ? 'text-white/50' : 'text-slate-600'
        }`}
      >
        <span className={`uppercase tracking-wider ${dark ? 'text-white/35' : 'text-slate-400'}`}>
          WX
        </span>
        <span className={dark ? 'text-sky-300/90' : 'text-sky-600'}>
          <WeatherIcon icon={c?.icon || 'cloud'} size={14} isDay={c?.isDay !== false} />
        </span>
        {c?.label && (
          <span className={`max-w-[110px] truncate ${dark ? 'text-white/60' : 'text-slate-600'}`}>
            {c.label}
          </span>
        )}
      </div>

      <div className="text-right">
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.16em] ${
            dark ? 'text-white/35' : 'text-slate-500'
          }`}
        >
          Now
        </p>

        <div className="mt-1 flex items-start justify-end gap-2">
          <div>
            {refreshing && !c ? (
              <div className="skeleton ml-auto h-11 w-24" />
            ) : (
              <div className="flex items-start justify-end gap-0.5">
                <span
                  className={`text-[40px] font-semibold leading-none tracking-tight tabular-nums sm:text-[44px] ${
                    dark ? 'text-white' : 'text-slate-900'
                  } ${refreshing ? 'opacity-55' : ''}`}
                >
                  {temp(t, unit)}
                </span>
                <span
                  className={`mt-1.5 text-base font-medium ${
                    dark ? 'text-white/35' : 'text-slate-400'
                  }`}
                >
                  °{unit}
                </span>
              </div>
            )}
            {c?.feels != null && (
              <p className={`mt-1.5 text-[11px] ${dark ? 'text-white/40' : 'text-slate-500'}`}>
                Feels like {temp(c.feels, unit)}°
              </p>
            )}
          </div>
        </div>

        {temps.length > 2 && (
          <div
            className={`mt-3 ml-auto flex h-9 w-[128px] items-end gap-0.5 rounded-lg px-1.5 py-1 ${
              dark ? 'bg-white/[0.04]' : 'bg-white/50'
            }`}
            title="Next 12 hours"
          >
            {temps.map((v, i) => (
              <div
                key={i}
                className={`spark-bar flex-1 ${
                  dark
                    ? 'bg-gradient-to-t from-sky-500/30 to-sky-300/80'
                    : 'bg-gradient-to-t from-sky-600/35 to-sky-500/70'
                }`}
                style={{ height: `${20 + ((v - lo) / span) * 72}%` }}
              />
            ))}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-1.5 text-right sm:mt-4 sm:gap-2">
          {metrics.map((row) => (
            <div key={row.label} className="surface-card px-2.5 py-2">
              <p
                className={`text-[9px] font-medium uppercase tracking-wide ${
                  dark ? 'text-white/35' : 'text-slate-400'
                }`}
              >
                {row.label}
              </p>
              <p
                className={`mt-0.5 text-sm font-semibold tabular-nums ${
                  dark ? 'text-white/90' : 'text-slate-800'
                }`}
              >
                {row.value}
                {row.sub ? (
                  <span className="ml-1 text-[10px] font-normal opacity-50">{row.sub}</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        title="Refresh weather"
        className={`pointer-events-auto flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-medium transition ${
          dark
            ? 'border-white/10 bg-black/35 text-white/70 hover:bg-white/10 hover:text-white'
            : 'border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50'
        }`}
      >
        <svg
          width="12"
          height="12"
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
        {refreshing ? 'Updating' : 'Refresh'}
      </button>
    </div>
  )
}
