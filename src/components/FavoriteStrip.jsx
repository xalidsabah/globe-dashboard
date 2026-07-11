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
      className={`fav-strip-safe pointer-events-auto absolute left-1/2 z-25 flex max-w-[min(92vw,520px)] -translate-x-1/2 items-center gap-1 overflow-x-auto panel-scroll rounded-full border px-1.5 py-1 backdrop-blur-md ${
        dark
          ? 'border-white/[0.08] bg-black/45'
          : 'border-slate-200/80 bg-white/85 shadow-sm'
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
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-left transition ${
            dark
              ? 'text-white/70 hover:bg-white/8 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className={dark ? 'text-sky-300/80' : 'text-sky-500'}>
            <WeatherIcon
              icon={city.icon || 'cloud'}
              size={14}
              isDay={city.isDay !== false}
            />
          </span>
          <span className="max-w-[72px] truncate text-[11px] font-medium">{city.name}</span>
          <span
            className={`tabular-nums text-[11px] ${
              dark ? 'text-white/45' : 'text-slate-400'
            }`}
          >
            {displayTemp(city.temp, unit)}°
          </span>
        </button>
      ))}
    </div>
  )
}
