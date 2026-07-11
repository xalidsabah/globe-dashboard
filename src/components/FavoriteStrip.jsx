/**
 * Thin multi-city glance for favorites — icon + name + temp only.
 */
import WeatherIcon from './WeatherIcon'
import { samePlace } from '../lib/places'
import { useI18n } from '../i18n/index.jsx'

function displayTemp(c, unit) {
  if (c == null) return '—'
  return unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

export default function FavoriteStrip({
  cities = [],
  place,
  unit = 'C',
  dark = true,
  onSelect,
  hidden = false,
}) {
  const { t } = useI18n()
  if (hidden || !cities.length) return null

  // Prefer other favorites; if only active, still show it briefly
  const list = cities.filter((c) => !samePlace(c, place)).slice(0, 6)
  if (!list.length) return null

  return (
    <div
      className={`fav-strip-safe glass-pill pointer-events-auto absolute left-1/2 z-25 flex max-w-[min(92vw,540px)] -translate-x-1/2 items-center gap-1 overflow-x-auto panel-scroll rounded-full px-1.5 py-1.5 ${
        dark ? '' : 'shadow-md shadow-slate-400/20'
      }`}
      role="list"
      aria-label={t('favorites')}
    >
      {list.map((city) => (
        <button
          key={`${city.lat},${city.lng}`}
          type="button"
          role="listitem"
          onClick={() => onSelect?.(city)}
          title={city.label || city.name}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-left transition ${
            dark
              ? 'text-white/75 hover:bg-white/10 hover:text-white'
              : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <span className={dark ? 'text-sky-300' : 'text-sky-700'}>
            <WeatherIcon
              icon={city.icon || 'cloud'}
              size={14}
              isDay={city.isDay !== false}
            />
          </span>
          <span className="max-w-[72px] truncate text-[11px] font-bold tracking-tight">
            {city.name}
          </span>
          <span
            className={`tabular-nums text-[11px] font-semibold ${
              dark ? 'text-white/50' : 'text-slate-700'
            }`}
          >
            {displayTemp(city.temp, unit)}°
          </span>
        </button>
      ))}
    </div>
  )
}
