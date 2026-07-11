import WeatherIcon from './WeatherIcon'
import StarButton from './StarButton'
import { samePlace } from '../lib/places'
import useQuietExpand from '../hooks/useQuietExpand'
import useLocalTime from '../hooks/useLocalTime'
import { useI18n } from '../i18n/index.jsx'

export default function LeftPromo({
  dark,
  place,
  weather,
  unit = 'C',
  outdoor = null,
  onHowItWorks,
  onOpenSearch,
  onToggleFavorite,
  isFavorite = false,
  favorites = [],
  onSelectFavorite,
  hidden,
  styleLeft = 'left-20',
}) {
  const forceOpen = useQuietExpand()
  const localTime = useLocalTime(weather?.timezone || place?.timezone)
  const { t } = useI18n()
  if (hidden) return null

  const c = weather?.current
  const air = weather?.air
  const temp = c?.temp
  const display =
    temp == null ? '—' : unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

  const otherFavs = favorites.filter((f) => !samePlace(f, place)).slice(0, 4)
  const aqiText = air?.labelKey ? t(air.labelKey) : air?.label && air.label !== '—' ? air.label : null

  const mute = dark ? 'text-white/30' : 'text-slate-700'
  const soft = dark ? 'text-white/50' : 'text-slate-900'

  return (
    <div
      className={`quiet-panel pointer-events-none absolute top-[38%] z-20 max-w-[200px] -translate-y-1/2 transition-all duration-300 sm:max-w-[220px] ${styleLeft} ${
        forceOpen ? 'is-open' : ''
      }`}
    >
      {/* Secondary: marketing + links — hover / focus / touch */}
      <div className="quiet-secondary quiet-gap-lg pointer-events-auto">
        <p className={`text-[11px] leading-snug ${mute}`}>
          <span className={soft}>{t('liveWeather')}</span> {t('planDay')}
          <span className="text-amber-400/70"> ✦</span>
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onHowItWorks}
            className={`text-[11px] transition ${
              dark
                ? 'text-amber-400/70 hover:text-amber-300'
                : 'text-amber-600/80 hover:text-amber-700'
            }`}
          >
            {t('howItWorks')}
          </button>
          <span className={dark ? 'text-white/15' : 'text-slate-300'} aria-hidden>
            ·
          </span>
          <button
            type="button"
            onClick={onOpenSearch}
            className={`text-[11px] transition ${
              dark ? 'text-white/35 hover:text-white/70' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('search')} <kbd className="kbd ml-0.5 opacity-70">/</kbd>
          </button>
        </div>
      </div>

      {/* Primary: place card — always visible */}
      <div
        className={`panel-float pointer-events-auto mt-2 flex items-center gap-2.5 px-3 py-2.5 ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            dark ? 'bg-sky-400/10 text-sky-300' : 'bg-sky-100 text-sky-700'
          }`}
        >
          <WeatherIcon icon={c?.icon || 'cloud'} size={22} isDay={c?.isDay !== false} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight tracking-tight">
            {place?.name || '—'}
          </p>
          <p className={`truncate text-[10px] font-medium leading-tight ${mute}`}>
            {c?.label || t('loading')}
            {localTime ? ` · ${localTime}` : ''}
            {aqiText ? ` · AQI ${aqiText}` : ''}
          </p>
        </div>
        <p className="text-display shrink-0 text-[22px] tabular-nums">
          {display}
          <span className="text-xs font-semibold opacity-35">°</span>
        </p>
        {place && onToggleFavorite && (
          <StarButton size="sm" filled={isFavorite} dark={dark} onClick={onToggleFavorite} />
        )}
      </div>

      {outdoor?.label && (
        <p className={`quiet-secondary quiet-gap text-[11px] leading-snug ${mute}`}>
          {t('bestOutdoors', { time: outdoor.label })}
          {outdoor.condition ? ` · ${outdoor.condition}` : ''}
        </p>
      )}

      {/* Secondary: favorite chips */}
      {otherFavs.length > 0 && (
        <div className="quiet-secondary quiet-gap pointer-events-auto flex flex-wrap gap-1">
          {otherFavs.map((f) => (
            <button
              key={`${f.lat},${f.lng}`}
              type="button"
              onClick={() => onSelectFavorite?.(f)}
              title={f.label || f.name}
              className={`max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                dark
                  ? 'text-white/40 hover:bg-white/5 hover:text-amber-200/90'
                  : 'text-slate-700 hover:bg-white hover:text-amber-800 border border-slate-300/80 bg-white/70'
              }`}
            >
              <span className="opacity-60" aria-hidden>
                ★
              </span>{' '}
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
